(function() {

	"use strict";

	var self;

	var $ = function(selector) {

		return document.querySelector(selector);

	};

	var $$ = function(selector) {

		return document.querySelectorAll(selector);

	};

	var Debug = {

		init: function() {

			self = this;

			pyro.log("debug.js initialization", true);

			$("body").insertAdjacentHTML('beforeend', '<div class="Debug_Guides CC" id="Debug_Guides"></div><div class="Debug_ConsoleButton" id="Debug_ConsoleButton"></div><div class="Debug_Console" id="Debug_Console"><div class="Debug_ConsoleContainer" id="Debug_ConsoleContainer"><div class="Debug_ConsoleContent" id="Debug_DeviceInfo"></div><div class="Debug_ConsoleContent" id="Debug_ConsoleContent"></div></div><div class="Debug_ConsoleHeader" id="Debug_ConsoleHeader">Debug Console</div><div class="Debug_GuidesButton CC" id="Debug_GuidesButton"></div><div class="Debug_CloseConsoleButton" id="Debug_CloseConsoleButton"></div><div class="Debug_FPSGraph" id="Debug_FPSGraph"><canvas class="Debug_FPSCanvas" id="Debug_FPSCanvas" width="400px" height="70px"></canvas><div class="Debug_Cursor" id="Debug_Cursor"></div></div><div class="Debug_Line" id="Debug_Line_60">60</div><div class="Debug_Line" id="Debug_Line_30">30</div><div class="Debug_Line" id="Debug_Line_0">0</div><div class="Debug_FPS" id="Debug_FPS"></div></div><div class="Debug_Darkness" id="Debug_Darkness"></div><div class="Debug_RefreshButton" id="Debug_RefreshButton"></div><div class="Debug_Refresh" id="Debug_Refresh"></div>');

			self.isConsoleOpen = false;

			self.drag = {};
			self.els = {};

			self.els.body = $("body");
			self.els.guides = $("#Debug_Guides");
			self.els.darkness = $("#Debug_Darkness");
			self.els.refreshButton = $("#Debug_RefreshButton");
			self.els.refresh = $("#Debug_Refresh");
			self.els.consoleButton = $("#Debug_ConsoleButton");
			self.els.console = $("#Debug_Console");
			self.els.consoleContainer = $("#Debug_ConsoleContainer");
			self.els.deviceInfo = $("#Debug_DeviceInfo");
			self.els.consoleContent = $("#Debug_ConsoleContent");
			self.els.closeConsoleButton = $("#Debug_CloseConsoleButton");
			self.els.guidesButton = $("#Debug_GuidesButton");
			self.els.fpsCanvas = $("#Debug_FPSCanvas");
			self.els.ctx = self.els.fpsCanvas.getContext("2d");
			self.els.fps = $("#Debug_FPS");
			self.els.cursor = $("#Debug_Cursor");

			self.guidesPositions = "LT,CT,RT,LC,CC,RC,LB,CB,RB".split(",");
			self.guidesPositionIndex = 4;

			window.onerror = function(message, url, lineNumber) {self.onError(message, url, lineNumber);};

			self.els.refreshButton.addEventListener(pyro.PRESS, self.refreshButton_onPress);
			self.els.consoleButton.addEventListener(pyro.PRESS, self.consoleButton_onPress);
			self.els.closeConsoleButton.addEventListener(pyro.TAP, self.closeConsole);

			self.els.guidesButton.addEventListener(pyro.PRESS, self.guidesButton_onPress);
			self.els.guidesButton.addEventListener(pyro.RELEASE, self.guidesButton_onRelease);
			self.els.guidesButton.addEventListener(pyro.TAP, self.guidesButton_onTap);

			self.fpsHistory = [];
			self.frames = 0;
			self.then = 0;
			self.areGuidesOn = false;

			window.addEventListener("orientationchange", function(){setTimeout(self.updateDeviceInfo, 500);}, false);

			if (!pyro.isFireDevice) {

				window.addEventListener("resize", function(){setTimeout(self.updateDeviceInfo, 500);}, false);

			}

			self.updateDeviceInfo();

			self.isInitialized = true;

			requestAnimFrame(self.countFrames);

		},

		onError: function(message, url, lineNumber, columnNumber, error) {

			pyro.log("[ERROR] " + lineNumber + ":" + columnNumber + " - " + message);
			pyro.log("[STACK TRACE] - " + error);

			return false;

		},

		updateGuidesPosition: function() {

			self.guidesPositionIndex ++;

			self.guidesPositionIndex = self.guidesPositionIndex % self.guidesPositions.length;

			self.els.guides.className = "Debug_Guides On " + self.guidesPositions[self.guidesPositionIndex];
			self.els.guidesButton.className = "Debug_GuidesButton On " + self.guidesPositions[self.guidesPositionIndex];
		},

		guidesButton_onPress: function() {

			clearInterval(self.guidesInterval);
			self.guidesInterval = setInterval(self.updateGuidesPosition, 500);

		},

		guidesButton_onRelease: function() {

			clearInterval(self.guidesInterval);

		},

		guidesButton_onTap: function() {

			clearInterval(self.guidesInterval);

			self.areGuidesOn = !self.areGuidesOn;

			if (self.areGuidesOn) {

				self.els.guides.classList.add("On");
				self.els.guidesButton.classList.add("On");

			} else {

				self.els.guides.classList.remove("On");
				self.els.guidesButton.classList.remove("On");

			}

		},

		refreshButton_onPress: function(e) {

			self.drag = {};

			self.drag.startX = pyro.touchPosition(e).x;
			self.drag.maxDeltaX = self.els.body.offsetWidth;
			self.drag.x = 0;
			self.drag.rotation = 0;
			self.drag.opacity = 0;
			self.drag.scale = 0;
			self.drag.deltaX = 0;
			self.drag.isDragging = false;

			self.els.refresh.classList.add("Dragging");
			self.els.darkness.classList.add("Dragging");

			self.els.body.removeEventListener(pyro.DRAG, self.refreshButton_onDrag);
			self.els.body.removeEventListener(pyro.RELEASE, self.refreshButton_onRelease);

			self.els.body.addEventListener(pyro.DRAG, self.refreshButton_onDrag);
			self.els.body.addEventListener(pyro.RELEASE, self.refreshButton_onRelease);

		},

		refreshButton_onDrag: function(e) {

			e.preventDefault();

			self.drag.isDragging = true;
			self.drag.x = pyro.touchPosition(e).x;
			self.drag.deltaX = self.drag.x - self.drag.startX;
			self.drag.deltaX = (self.drag.deltaX < 0) ? 0 : self.drag.deltaX;
			self.drag.scale = 0.75 + self.drag.deltaX / self.drag.maxDeltaX;
			self.drag.rotation = Math.floor((self.drag.deltaX / (self.drag.maxDeltaX * 0.5)) * 360) % 360;
			self.drag.opacity = (5 * self.drag.deltaX) / self.drag.maxDeltaX;

			self.els.refresh.style.cssText = "-webkit-transform: scale3d(" + self.drag.scale + "," + self.drag.scale + ",1) rotateZ(" + self.drag.rotation + "deg); opacity: " + self.drag.opacity + ";";
			self.els.darkness.style.cssText = "opacity: " + self.drag.opacity + ";";

			if (self.drag.deltaX / self.drag.maxDeltaX >= 0.6) {

				self.refreshButton_onRelease();

			}

		},

		refreshButton_onRelease: function() {

			self.els.body.removeEventListener(pyro.DRAG, self.refreshButton_onDrag);
			self.els.body.removeEventListener(pyro.RELEASE, self.refreshButton_onRelease);

			self.els.refresh.classList.remove("Dragging");
			self.els.darkness.classList.remove("Dragging");

			if (self.drag.isDragging) {

				self.drag.isDragging = false;

				self.els.refresh.style.cssText = "";
				self.els.darkness.style.cssText = "";

				if (self.drag.deltaX >= self.drag.maxDeltaX * 0.5) {

					self.els.refresh.classList.add("On");
					self.els.darkness.classList.add("On");

					setTimeout(function(){window.location.reload(true);}, 1000);

				}

			}

		},

		consoleButton_onPress: function(e) {

			self.drag = {};

			self.drag.startX = pyro.touchPosition(e).x;
			self.drag.minX = 400;
			self.drag.opacity = 0;
			self.drag.deltaX = 0;
			self.drag.isDragging = false;
			self.drag.opacity = 0;

			self.els.console.classList.add("Dragging");

			self.els.consoleContent.innerHTML = pyro.debugLog;

			self.els.body.removeEventListener(pyro.DRAG, self.consoleButton_onDrag);
			self.els.body.removeEventListener(pyro.RELEASE, self.consoleButton_onRelease);

			self.els.body.addEventListener(pyro.DRAG, self.consoleButton_onDrag);
			self.els.body.addEventListener(pyro.RELEASE, self.consoleButton_onRelease);

		},

		consoleButton_onDrag: function(e) {

			e.preventDefault();

			self.drag.isDragging = true;
			self.drag.deltaX = pyro.touchPosition(e).x - self.drag.startX;
			self.drag.deltaX = (self.drag.deltaX > 0) ? 0 : self.drag.deltaX;
			self.drag.deltaX = (self.drag.deltaX < 0 - self.drag.minX) ? -1 * self.drag.minX : self.drag.deltaX;
			self.drag.opacity = self.drag.deltaX / self.drag.minX * -1;

			self.els.console.style.cssText = "-webkit-transform: translate3d(" + self.drag.deltaX + "px,0,0); opacity: " + self.drag.opacity + ";";

		},

		consoleButton_onRelease: function() {

			self.els.body.removeEventListener(pyro.DRAG, self.consoleButton_onDrag);
			self.els.body.removeEventListener(pyro.RELEASE, self.consoleButton_onRelease);

			self.els.console.classList.remove("Dragging");

			if (self.drag.isDragging) {

				self.drag.isDragging = false;

				self.els.console.style.cssText = "";

				if (self.drag.deltaX <= self.drag.minX * -0.5) {

					self.openConsole();

				} else {

					self.closeConsole();

				}

			}

		},

		openConsole: function() {

			self.els.consoleContent.innerHTML = pyro.debugLog;
			self.els.console.classList.remove("Dragging")
			self.els.console.classList.add("Open");
			self.isConsoleOpen = true;

		},

		closeConsole: function() {

			self.els.console.classList.remove("Dragging");
			self.els.console.classList.remove("Open");
			self.isConsoleOpen = false;

		},

		updateDeviceInfo: function() {

			var html = "";

			html += "<div class=\"Debug_Col_1\">Device:</div><div class=\"Debug_Col_2\">" + pyro.device.name + "</div><br/>";
			html += "<div class=\"Debug_Col_1\">Fire OS:</div><div class=\"Debug_Col_2\">" + pyro.fireOSVersion + " (" + pyro.androidVersion + ")</div><br/>";
			html += "<div class=\"Debug_Col_1\">Orientation:</div><div class=\"Debug_Col_2\">" + pyro.orientation + "</div><br/><br/>";

			if (pyro.orientation === "Landscape") {

				html += "<div class=\"Debug_Col_1\">Device Resolution:</div><div class=\"Debug_Col_2\">" + Math.max(pyro.device.width, pyro.device.height) + "px ✕ " + Math.min(pyro.device.width, pyro.device.height) + "px</div><br/>";
				html += "<div class=\"Debug_Col_1\">CSS Resolution:</div><div class=\"Debug_Col_2\">" + Math.max(Math.round(document.body.offsetWidth * pyro.device.scale), Math.round(document.body.offsetHeight * pyro.device.scale)) + "px ✕ " + Math.min(Math.round(document.body.offsetWidth * pyro.device.scale), Math.round(document.body.offsetHeight * pyro.device.scale)) + "px</div><br/>";
				html += "<div class=\"Debug_Col_1\">Normalized Resolution:</div><div class=\"Debug_Col_2\">" + Math.max(document.body.offsetWidth, document.body.offsetHeight) + "px ✕ " + Math.min(document.body.offsetWidth, document.body.offsetHeight) + "px</div><br/>";

			} else {

				html += "<div class=\"Debug_Col_1\">Device Resolution:</div><div class=\"Debug_Col_2\">" + Math.min(pyro.device.width, pyro.device.height) + "px ✕ " + Math.max(pyro.device.width, pyro.device.height) + "px</div><br/>";
				html += "<div class=\"Debug_Col_1\">CSS Resolution:</div><div class=\"Debug_Col_2\">" + Math.min(Math.round(document.body.offsetWidth * pyro.device.scale), Math.round(document.body.offsetHeight * pyro.device.scale)) + "px ✕ " + Math.max(Math.round(document.body.offsetWidth * pyro.device.scale), Math.round(document.body.offsetHeight * pyro.device.scale)) + "px</div><br/>";
				html += "<div class=\"Debug_Col_1\">Normalized Resolution:</div><div class=\"Debug_Col_2\">" + Math.min(document.body.offsetWidth, document.body.offsetHeight) + "px ✕ " + Math.max(document.body.offsetWidth, document.body.offsetHeight) + "px</div><br/>";

			}

			self.els.deviceInfo.innerHTML = html;

		},

		countFrames: function() {

			self.now = new Date().getTime();
			self.elapsed = self.now - self.then;

			self.frames ++;

			if (self.elapsed >= 250) {

				self.updateFPS();

			}

			requestAnimFrame(self.countFrames);

		},

		updateFPS: function() {

			var fps = Math.floor(self.frames * 1000 / self.elapsed);
			var red = (60 - fps) / 30;
			var green = fps / 30;

			red = Math.round(Math.max(Math.min(red * 255, 255), 0));
			green = Math.round(Math.max(Math.min(green * 255, 255), 0));

			var color = "rgba(" + red + "," + green + ",0,1)";
			var h = fps + 1;

			self.els.fps.innerHTML = fps + " fps";
			self.els.cursor.style.cssText = "background-color: " + color + "; height: " + h + "px;";

			self.fpsHistory.unshift(fps);
			self.fpsHistory.splice(200);

			self.frames = 0;
			self.elapsed = 0;
			self.then = self.now;

			self.updateCanvas();

		},

		updateCanvas: function() {

			var fps;

			self.els.fpsCanvas.width = 800;
			self.els.fpsCanvas.height = 140;

			self.els.ctx.setTransform(2, 0, 0, 2, 0, 0);
			self.els.ctx.clearRect(0, 0, 402, 72);

			self.els.ctx.beginPath();
			self.els.ctx.lineWidth = 1;

			self.els.ctx.moveTo(402, 72);
			self.els.ctx.lineTo(402, 70 - self.fpsHistory[0]);

			var x = 400;

			for (var i = 0; i < 200; i ++) {

				fps = self.fpsHistory[i];

				if (fps === undefined) {

					break;

				}


				self.els.ctx.lineTo(x, 70 - fps);

				x = x - 2;

			}

			self.els.ctx.lineTo(x - 2, 70 - fps);
			self.els.ctx.lineTo(x - 2, 72);
			self.els.ctx.lineTo(402, 72);
			self.els.ctx.closePath();

			var gradient = self.els.ctx.createLinearGradient(0,70,0,10);
			gradient.addColorStop(0,"rgba(255,255,255,0)");
			gradient.addColorStop(1,"rgba(255,255,255,0.25)");

			self.els.ctx.fillStyle = gradient;

			self.els.ctx.strokeStyle = "rgba(255,255,255,0.5)";
			self.els.ctx.fill();
			self.els.ctx.stroke();

		},

		log: function() {

			if (self.isConsoleOpen) {

				self.els.consoleContent.innerHTML = pyro.debugLog;

			}

		}

	}

	window.requestAnimFrame = (function(){
		return  	window.requestAnimationFrame       ||
				window.webkitRequestAnimationFrame ||
				function( callback ){
				window.setTimeout(callback, 1000 / 60);
		};
	})();

	window.debug = Debug;

	if (pyro.isWindowLoaded) {

		debug.init();

	} else {

		window.addEventListener("load", function(){debug.init();}, false);

	}

})();
