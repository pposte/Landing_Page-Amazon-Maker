(function() {

	"use strict";

	var self;

	var $ = function(selector) {

		return document.querySelector(selector);

	};

	var $$ = function(selector) {

		return document.querySelectorAll(selector);

	};

	var Preview = {

		init: function() {

			self = this;

			self.els = {};

			self.els.html = $("html");
			self.els.body = $("body");

			window.addEventListener("message", function(e){self.onMessage(e);}, false);

			self.els.body.addEventListener("mousemove", function(e){self.body_onMouseMove(e);});
			self.els.body.addEventListener("mousedown", function(){self.body_onMouseDown();});
			self.els.body.addEventListener("mouseup", function(){self.body_onMouseUp();});
			self.els.body.addEventListener("keydown", function(e){self.body_onKeyDown(e);});

			self.setZoom();
			self.setDevice();

			self.zoomDevice(self.zoom);

			self.sendMessage("loaded");
			self.sendMessage("title", {title: document.title, modified: document.lastModified});

		},

		setDevice: function() {

			for (var d in pyro.devices) {

				if (pyro.devices.hasOwnProperty(d)) {

					if (window.location.hash.search("/" + pyro.devices[d].name + "/") > -1) {

						self.updateDevice(pyro.devices[d], self.zoom);

					}

				}

			}

		},

		updateDevice: function(device, zo) {

			var orientation = (window.innerWidth > window.innerHeight) ? "Landscape" : "Portrait";

			self.els.html.className = device.name + " " + device.category + " Gen" + device.gen + " " + orientation + " Zoom_" + zo;

		},

		setZoom: function() {

			self.zoom = 100;
			self.zoom = (window.location.hash.search("/50/") != -1) ? 50 : self.zoom;
			self.zoom = (window.location.hash.search("/75/") != -1) ? 75 : self.zoom;
			self.zoom = (window.location.hash.search("/200/") != -1) ? 200 : self.zoom;

		},

		zoomDevice: function(zoom) {

			self.els.html.classList.remove("Zoom_200", "Zoom_100", "Zoom_75", "Zoom_50");
			self.els.html.classList.add("Zoom_" + zoom);
			self.zoom = zoom;

		},

		body_onMouseMove: function(e) {

			var pos = self.touchPosition(e);

			self.sendMessage("mousemove", pos);

		},

		body_onMouseDown: function() {

			self.sendMessage("mousedown");

		},

		body_onMouseUp: function() {

			self.sendMessage("mouseup");

		},

		body_onKeyDown: function(e) {

			var isShiftDown = e.shiftKey
			var isControlDown = e.ctrlKey;
			var isCommandDown = e.metaKey;
			var isAltDown = e.altKey;

			var options = {};
			options.which = e.which;
			options.isShiftDown = isShiftDown;
			options.isCommandDown = isCommandDown;
			options.isControlDown = isControlDown;
			options.isAltDown = isAltDown;

			if (e.which === 82 && isCommandDown) {

				// CMD r
				self.onKeyboardShortcut(options);

				e.preventDefault();
				e.stopPropagation();
				return false;

			} else if (e.which === 187 && isCommandDown) {

				// CMD +
				self.onKeyboardShortcut(options);

				e.preventDefault();
				e.stopPropagation();
				return false;

			} else if (e.which === 189 && isCommandDown) {

				// CMD -
				self.onKeyboardShortcut(options);

				e.preventDefault();
				e.stopPropagation();
				return false;

			} else if (e.which === 79 && isCommandDown) {

				// CMD o
				self.onKeyboardShortcut(options);

				e.preventDefault();
				e.stopPropagation();
				return false;

			} else if (e.which === 76 && isCommandDown) {

				// CMD l
				self.onKeyboardShortcut(options);

				e.preventDefault();
				e.stopPropagation();
				return false;

			} else if (e.which === 80 && isCommandDown) {

				// CMD p
				self.onKeyboardShortcut(options);

				e.preventDefault();
				e.stopPropagation();
				return false;

			}

		},

		onKeyboardShortcut: function(options) {

			self.sendMessage("onKeyboardShortcut", options);

		},

		getFullURL: function(url) {

			var link = document.createElement("a");
			link.href = url;

			return (link.protocol + "//" + link.host + link.pathname + link.search + link.hash);

		},

		launchIntent: function(intentObject) {

			var message = "While previewing in the browser, some actions are purposely suppressed. ";

			if (intentObject.url) {

				intentObject.url = self.getFullURL(intentObject.url);

				if (intentObject.url.indexOf(".mp4") === intentObject.url.length - 4) {

					self.sendMessage("video", {"url": intentObject.url});

					return;

				}

			}

			if (intentObject.type === "Link In" || intentObject.type === "Link Out") {

				message += "On device, this action would open the link below:<br><br><a href='" + intentObject.url + "' target='_blank'>" + intentObject.url + "</a>";

			} else if (intentObject.type === "Video URL") {

				self.sendMessage("video", {"url": intentObject.url});

				return;

			} else if (intentObject.asin) {

				message += "On device, this action would open asin " +  intentObject.asin + " in the appropriate native app.";

			} else if (intentObject.query) {

				message += "On device, this action would search for " +  intentObject.query + " in the appropriate native app.";
			}

			self.sendMessage("alert", {"title": intentObject.type + " Action", "body": message});

		},

		open: function(url) {

			url = self.getFullURL(url);

			if (url.indexOf(".mp4") === url.length - 4) {

				self.sendMessage("video", {"url": url});

			} else {

				var message = "While previewing in the browser, some actions are purposely suppressed. On device, this action would open the link below:<br><br><a href='" + url + "' target='_blank'>" + url + "</a>";

				self.sendMessage("alert", {"title": "Open URL Action", "body": message});

			}

		},

		sendMessage: function (type, data) {

			var message = {};

			message.type = type;
			message.data = data;

			window.parent.postMessage(JSON.stringify(message), "*");

		},

		onMessage: function(event) {

			var message = JSON.parse(event.data);

			var type = message.type;
			var data = message.data;

			switch(type) {

				case "reload":
					window.location.reload(true);
					break;

				case "updateDevice":
					self.updateDevice(data.device, data.zoom);
					break;

				case "zoom":
					self.zoomDevice(parseInt(data.level));
					break;


			}

		},

		touchPosition: function(e) {

			var pos = {};

			if (!!("ontouchstart" in window) && e.touches) {

				pos.x = e.touches[0].pageX;
				pos.y = e.touches[0].pageY;

			} else {

				pos.x = e.clientX / (self.zoom / 100);
				pos.y = e.clientY / (self.zoom / 100);

			}

			return pos;

		}

	}

	window.preview = Preview;
	window.open = preview.open;

	pyro.touchPosition = preview.touchPosition;
	pyro.launchIntent = preview.launchIntent;

	window.addEventListener("load", function(){preview.init();}, false);

})();
