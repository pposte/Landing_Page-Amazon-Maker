(function() {

	'use strict';

	var self;

	var $ = function(selector) {

		return document.querySelector(selector);

	};

	var $$ = function(selector) {

		return document.querySelectorAll(selector);

	};

	var Pyro = {

		init: function() {

			self = this;

			self.VERSION = '1.0';

			self.isLandingContext = false;
			self.isWakeContext = false;
			self.isSilkContext = false;
			self.isAppContext = false;
			self.isWindowLoaded = false;
			self.debugLog = '';
			self.isDebugMode = false;
			self.isPreviewMode = false;
			self.isFullScreen = false;
			self.isOrientationLocked = false;

			self.els = {};
			self.els.html = $('html');

			self.parseURL();

			self.log('pyro.js (' + self.VERSION + ') initialization', true);

			self.setDevice();
			self.setOS();
			self.setWebview();
			self.setContext();
			self.setClassList();
			self.setEvents();
			self.normalizeViewport();
			self.loadDebug();
			self.loadPreview();

		},

		parseURL: function() {

			self.isDebugMode = (window.location.hash.toLowerCase().indexOf('debug') > -1 || window.location.href.indexOf('isDebugMode=1') > -1);
			self.isPreviewMode = (window.location.hash.toLowerCase().indexOf('preview') > -1 || window.location.href.indexOf('isPreviewMode=1') > -1);

		},

		setDevice: function() {

			var devices = {
				//  Gen 5
				KFOT: {
					name: 'Otter',
					streetName: '2011 Kindle Fire',
					gen: 5,
					category: '_sm',
					ratio: 0.75,
					scale: 0.7500000000,
					width: 600,
					height: 1024
				},
				KFTT: {
					name: 'Tate',
					streetName: '2012 Kindle Fire HD',
					gen: 5,
					category: '_md',
					ratio: 1.00,
					scale: 1.0000000000,
					width: 800,
					height: 1280
				},
				KFJW: {
					name: 'Jem',
					streetName: '2012 Kindle Fire HD 8.9',
					gen: 5,
					category: '_lg',
					ratio: 1.50,
					scale: 1.5000000000,
					width: 1200,
					height: 1920
				},
				//  Gen 6
				KFSOW: {
					name: 'Soho',
					streetName: '2013 Kindle Fire HD',
					gen: 6,
					category: '_md',
					ratio: 1.00,
					scale: 0.6666666667,
					width: 800,
					height: 1280
				},
				KFTHW: {
					name: 'Thor',
					streetName: '2013 Kindle Fire HDX',
					gen: 6,
					category: '_lg',
					ratio: 1.50,
					scale: 0.7500000000,
					width: 1200,
					height: 1920
				},
				KFAPW: {
					name: 'Apollo',
					streetName: '2013 Kindle Fire HDX 8.9',
					gen: 6,
					category: '_xl',
					ratio: 2.00,
					scale: 1.0000000000,
					width: 1600,
					height: 2560
				},
				//  Gen 7
				KFARW: {
					name: 'Ariel',
					streetName: '2014 Fire HD 6',
					gen: 7,
					category: '_md',
					ratio: 1.00,
					scale: 0.6666666667,
					width: 800,
					height: 1280
				},
				KFASW: {
					name: 'Aston',
					streetName: '2014 Fire HD 7',
					gen: 7,
					category: '_md',
					ratio: 1.00,
					scale: 0.6666666667,
					width: 800,
					height: 1280
				},
				KFSAW: {
					name: 'Saturn',
					streetName: '2014 Fire HDX 8.9',
					gen: 7,
					category: '_xl',
					ratio: 2.00,
					scale: 1.0000000000,
					width: 1600,
					height: 2560
				},
				// Gen 8
				KFFOW: {
					name: 'Ford',
					streetName: '2015 Fire',
					gen: 8,
					category: '_sm',
					ratio: 0.75,
					scale: 0.7500000000,
					width: 600,
					height: 1024
				},
				KFMEW: {
					name: 'Memphis',
					streetName: '2015 Fire HD 8',
					gen: 8,
					category: '_md',
					ratio: 1.00,
					scale: 0.7500000000,
					width: 800,
					height: 1280
				},
				KFTBW: {
					name: 'Thebes',
					streetName: '2015 Fire HD 10',
					gen: 8,
					category: '_md',
					ratio: 1.00,
					scale: 1.0000000000,
					width: 800,
					height: 1280
				},
				// Gen 9
				KFGIW: {
					name: 'Giza',
					streetName: '2016 Fire HD 8',
					gen: 9,
					category: '_md',
					ratio: 1,
					scale: 0.7500000000,
					width: 800,
					height: 1280
				}
			};

			self.device = {};

			for (var d in devices) {

				if (devices.hasOwnProperty(d)) {

					if (navigator.userAgent.search(d) > -1) {

						self.isFireDevice = true;
						self.device = devices[d];

					}

				}

			}

			if (!self.device.name) {

				self.isFireDevice = false;
				self.device = devices.KFSAW;

			}

			self.isEmulating = (navigator.platform.indexOf('Mac') === 0 || navigator.platform.indexOf('Win') === 0);

			if (!self.isEmulating) {

				if (self.device.gen > 5) {

					self.device.scale = (self.device.width / 800) / window.devicePixelRatio;

				} else {

					self.device.scale = self.device.width / 800;

				}

			}

		},

		setOS: function() {

			var android = navigator.userAgent.match(/Android [\d+\.]{3,5}/);

			if (android) {

				self.androidVersion = android[0].replace('Android ', '');

			} else {

				self.androidVersion = '5.1';

			}

			self.fireOSVersion = parseInt(self.androidVersion);
			self.device.fireOSVersion = self.fireOSVersion;

		},

		setWebview: function() {

			var start = navigator.userAgent.search('Chrome');

			if (start > -1) {

				self.webview = navigator.userAgent.substr(start,9).replace('/','_');

			} else {

				self.webview = 'Android';

			}

			if (navigator.userAgent.search('Safari') !== -1 && navigator.platform === 'MacIntel') {

				self.webview = 'Chrome_34';

			}

			self.device.webview = self.webview;

		},

		setContext: function() {

			if (navigator.userAgent.indexOf('DTCP') > -1 || self.isEmulating) {

				self.context = 'Landing';
				self.isLandingContext = true;

			} else if (navigator.userAgent.indexOf('Silk') > -1) {

				self.context = 'Silk';
				self.isSilkContext = true;

			} else {

				self.context = 'Wake';
				self.isWakeContext = true;

			}

		},

		setClassList: function() {

			if (!self.isFireDevice) {

				self.orientation = (window.innerWidth > window.innerHeight) ? 'Landscape' : 'Portrait';

			} else {

				self.orientation = (screen.width > screen.height) ? 'Landscape' : 'Portrait';

			}

			self.els.html.className = self.device.name + ' ' + self.device.category + ' Gen' + self.device.gen + ' FireOS_' + self.fireOSVersion + ' ' + self.webview + ' ' + self.orientation;

		},

		normalizeViewport: function() {

			if (self.device && self.device.scale) {

				var content = 'initial-scale=' + self.device.scale + ', minimum-scale=' + self.device.scale + ', maximum-scale=' + self.device.scale;

				if (self.device.webview === 'Android') {

					content += ', target-densityDpi=device-dpi';

				} else {

					content += ', width=device-width';

				}

				$('[name="viewport"]').content = content;

			}

		},

		setEvents: function() {

			if (self.isFireDevice) {

				self.PRESS = 'touchstart';
				self.DRAG = 'touchmove';
				self.RELEASE = 'touchend';
				self.TAP = 'click';

			} else {

				self.PRESS = 'mousedown';
				self.DRAG = 'mousemove';
				self.RELEASE = 'mouseup';
				self.TAP = 'click';

			}

		},

		loadDebug: function() {

			if (self.isDebugMode) {

				var script = document.createElement('script');
				script.setAttribute('src','https://ksomedia.s3.amazonaws.com/pyrojs/' + self.VERSION + '/dist/debug/debug.js');

				document.head.appendChild(script);

				var link = document.createElement('link');
				link.href = 'https://ksomedia.s3.amazonaws.com/pyrojs/' + self.VERSION + '/dist/debug/debug.css';
				link.rel = 'stylesheet';

				document.head.appendChild(link);

			}

		},

		loadPreview: function() {

			if (self.isPreviewMode) {

				var script = document.createElement('script');
				script.setAttribute('src','https://ksomedia.s3.amazonaws.com/pyrojs/' + self.VERSION + '/dist/preview/preview.js');

				document.head.appendChild(script);

				var link = document.createElement('link');
				link.href = 'https://ksomedia.s3.amazonaws.com/pyrojs/' + self.VERSION + '/dist/preview/preview.css';
				link.rel = 'stylesheet';

				document.head.appendChild(link);

			}

		},

		enableDebugMode: function() {

			self.isDebugMode = true;
			self.loadDebug();

		},

		onViewportChange: function() {

			if (!self.isFireDevice) {

				if (window.innerWidth > window.innerHeight) {

					self.els.html.classList.remove('Portrait');
					self.els.html.classList.add('Landscape');

					self.orientation = 'Landscape';

				} else {

					self.els.html.classList.remove('Landscape');
					self.els.html.classList.add('Portrait');

					self.orientation = 'Portrait';

				}

			} else if (window.orientation !== undefined) {

				if (Math.abs(window.orientation) === 90) {

					self.els.html.classList.remove('Portrait');
					self.els.html.classList.add('Landscape');

					self.orientation = 'Landscape';

				} else {

					self.els.html.classList.remove('Landscape');
					self.els.html.classList.add('Portrait');

					self.orientation = 'Portrait';

				}

			} else if (screen.width > screen.height) {

				self.els.html.classList.remove('Portrait');
				self.els.html.classList.add('Landscape');

				self.orientation = 'Landscape';

			} else {

				self.els.html.classList.remove('Landscape');
				self.els.html.classList.add('Portrait');

				self.orientation = 'Portrait';

			}

		},

		trackEvent: function(slotID, label) {

			if (window.evt) {

				window.evt.clk(slotID);

			} else if (window.ksoContext) {

				var metrics = {};

				metrics.AdID = window.ksoContext.adId;
				metrics.slotId = parseInt(slotID);

				JSBridge.onJSEvent("kso.metricsInterface.click('" + JSON.stringify(metrics) + "');");

			}

			if (label) {

				self.log(slotID + ': ' + label);

			} else {

				self.log('Track: ' + slotID);

			}

		},

		touchPosition: function(e) {

			var pos = {};

			if (!!('ontouchstart' in window) && e.touches) {

				pos.x = e.touches[0].pageX;
				pos.y = e.touches[0].pageY;

			} else {

				pos.x = e.clientX;
				pos.y = e.clientY;

			}

			return pos;

		},

		preload: function(assetPaths, onComplete) {

			var remaining = [];
			var asset;

			if (typeof assetPaths !== 'object') {

				assetPaths = [assetPaths];

			}

			var complete = function() {

				remaining.pop();

				if (onComplete && remaining.length === 0) {

					onComplete();

				}

			}

			for (var i = 0; i < assetPaths.length; i ++) {

				remaining.push(assetPaths[i]);

				asset = new Image();
				asset.onload = complete;
				asset.onerror = complete;
				asset.src = assetPaths[i];

			}

		},

		deviceImage: function(imagePath, affix) {

			var cat = self.device.category.replace('_', '');
			var index;

			if (affix === 'prefix') {

				index = imagePath.lastIndexOf('/');

				return imagePath.substring(0, index + 1) + cat + '_' + imagePath.substring(index + 1);

			} else {

				index = imagePath.lastIndexOf('.');

				return imagePath.substring(0, index) + '_' + cat + imagePath.substring(index);

			}

		},

		enterFullscreen: function() {

			if (window.WVUIExtensions) {

				WVUIExtensions.enterFullscreen();
				WVUIExtensions.hideSystemBars();

				window.addEventListener('beforeunload', function(e) {

					self.exitFullscreen();

				});

				self.isFullScreen = true;

				return true;

			} else {

				return false;

			}

		},

		exitFullscreen: function() {

			if (window.WVUIExtensions) {

				WVUIExtensions.showSystemBars();
				WVUIExtensions.exitFullscreen();

				self.isFullScreen = false;

				return true;

			} else {

				return false;

			}

		},

		lockOrientation: function(orientation) {

			orientation = orientation || self.orientation;
			orientation = orientation.toLowerCase();

			if (window.WVUIExtensions) {

				if (orientation === 'landscape') {

					if (window.orientation === -90 && WVUIExtensions.strictLockOrientationLandscape) {

						WVUIExtensions.strictLockOrientationLandscape();

					} else if (window.orientation === 90 && WVUIExtensions.strictLockOrientationReverseLandscape) {

						WVUIExtensions.strictLockOrientationReverseLandscape();

					} else {

						WVUIExtensions.lockOrientationLandscape();

					}

				} else {

					if (window.orientation === 0 && WVUIExtensions.strictLockOrientationPortrait) {

						WVUIExtensions.strictLockOrientationPortrait();

					} else if (window.orientation === 180 && WVUIExtensions.strictLockOrientationReversePortrait) {

						WVUIExtensions.strictLockOrientationReversePortrait();

					} else {

						WVUIExtensions.lockOrientationPortrait();

					}

				}

				window.addEventListener('beforeunload', function(e) {

					self.unlockOrientation();

				});

				self.isOrientationLocked = true;

				return true;

			} else {

				return false;

			}

		},

		unlockOrientation: function() {

			if (window.WVUIExtensions) {

				WVUIExtensions.resetOrientation();

				self.isOrientationLocked = false;

				return true;

			} else {

				return false;

			}

		},

		launchIntent: function(intentObject) {

			var type = intentObject.type;
			var asin = intentObject.asin;
			var query = intentObject.query;
			var url = intentObject.url;
			var title = intentObject.title;
			var slotID = intentObject.slotID || 0;
			var label = intentObject.label;

			var intent;

			switch(type) {

				// URLS
				case 'Link In':

					intent = url;
					break;

				case 'Link Out':

					if (self.isPreviewMode) {

						intent = url;

					} else {

						intent = (url.indexOf('http') === 0) ? url.replace('http', 'browser') : '';

					}

					break;

				// SEARCHES
				case 'Video Search':

					intent = 'intent://#Intent;action=android.intent.action.SEARCH;component=com.amazon.avod/.client.activity.SearchListActivity;S.intent_extra_data_key=' + escape(query) + ';end';
					break;

				case 'Music Search':

					intent = 'amzn://mp3/android?s=' + asin.replace('|', '%7C') + ';end';
					break;

				case 'Product Search':

					intent = 'intent:#Intent;action=android.intent.action.SEARCH;component=com.amazon.windowshop/.search.SearchResultsGridActivity;S.query=' + asin.replace('|', '%7C') + ';end';
					break;

				// PRODUCT DETAILS
				case 'Song Detail':

					intent = 'amzn://mp3/android/buy?ASIN=' + asin + '&type=track';
					break;

				case 'Album Detail':

					intent = 'amzn://mp3/android/buy?ASIN=' + asin + '&type=album';
					break;

				case 'App Detail':

					intent = 'amzn://apps/android?asin=' + asin;
					//intent = 'intent://apps/android?asin=' + asin + '#Intent;scheme=amzn;';
					break;

				case 'Book Detail':

					intent = 'kindle://store/openstore/?asin=' + asin + '&storefront-context=ebooks';
					intent = 'intent:#Intent;action=com.amazon.webapp.msg.openWebApp.KINDLE_STORE;S.destination=DETAIL;S.storefront-context=ebooks;S.asin=' + asin + ';end';
					break;

				case 'Video Detail':

					intent = 'intent://com.amazon.avod.detail#Intent;scheme=content;action=android.intent.action.VIEW;launchFlags=0x10000000;S.asin=' + asin + ';end';
					break;

				case 'Product Detail':

					intent = 'intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;launchFlags=0x10000000;package=com.amazon.windowshop;component=com.amazon.windowshop/.home.HomeLauncherActivity;S.com.amazon.windowshop.refinement.asin=' + asin + ';end';
					break;

				case 'IMDB Detail':

					intent = 'imdb://title/' + query + '/';
					break;

				case 'Audible Detail':

					intent = 'audible://https%3A//mobile.audible.com/TOS/productDetail.htm?source_code=KDLDG902CWS051712&sku=' + query;
					break;

				case 'Product Browse Node':

					intent = 'intent:#Intent;action=android.intent.action.SEARCH;component=com.amazon.windowshop/.browse.BrowseActivity;S.com.amazon.windowshop.BrowseNodeId=' + query + ';S.com.amazon.windowshop.StoreId=apparel;S.ref=fake;end';
					break;

				// PLAY VIDEO
				case 'Video ASIN':

					intent = 'intent://#Intent;package=com.amazon.avod;component=com.amazon.avod/.client.activity.VideoDispatcherActivity;launchFlags=0x10000000;S.asin=' + asin + ';S.Auto_Play_Mode=true;S.Suppress_Next_Episode=true;end';
					break;

				case 'Video URL':

					intent = url;
					break;

				// STOREFRONTS
				case 'All Storefronts':

					intent = 'intent:#Intent;action=com.amazon.shop.STOREPICKER;end';
					break;

				case 'Music Storefront':

					intent = 'amzn://mp3/android/buy';
					break;

				case 'App Storefront':

					intent = 'amzn://apps/android';
					break;

				case 'Audible Storefront':

					intent = 'audible://https%3A//mobile.audible.com/TOS/index.htm';
					break;

				case 'eBook Storefront':

					intent = 'intent://#Intent;action=com.amazon.webapp.msg.openWebApp.KINDLE_STORE;launchFlags=0x10000000;component=com.amazon.webapp/com.amazon.kindlestore.KindleStoreActivity;S.destination=BOOKSTORE;end';
					break;

				case 'Newsstand Storefront':

					intent = 'intent://#Intent;action=com.amazon.webapp.msg.openWebApp.KINDLE_STORE;launchFlags=0x10000000;component=com.amazon.webapp/com.amazon.kindlestore.KindleStoreActivity;S.destination=NEWSSTAND;end';
					break;

				case 'Product Storefront':

					intent = 'intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;launchFlags=0x10000000;package=com.amazon.windowshop;component=com.amazon.windowshop/.home.HomeLauncherActivity;end';
					break;

				case 'Video Storefront':

					intent = 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;launchFlags=0x10000000;package=com.amazon.avod;component=com.amazon.avod/.client.activity.HomeScreenActivity;end';
					break;

				// NATIVE ACTIONS
				case 'Home Screen':

					intent = 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.HOME;end';
					break;

				case 'View All Offers':

					intent = 'intent:#Intent;action=com.amazon.kindle.dtcp.action.VIEW_SPECIAL_OFFERS;package=com.amazon.kindle.kso;end';
					break;

				case 'Share URL':

					intent = 'intent://#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=' + escape(url) + ';S.android.intent.extra.SUBJECT=' + escape(title) + ';end';
					break;

			}

			self.log('Intent: ' + intent);

			if (self.isWakeContext) {

				var cta = {};
				var metrics = {};

				cta.activity_uri = intent;

				metrics.AdID = window.ksoContext.adId;
				metrics.slotId = parseInt(slotID);

				JSBridge.onJSEvent("kso.ctaInterface.launch('" + JSON.stringify(cta) + "','" + JSON.stringify(metrics) + "');");

			} else {

				if (slotID) {

					self.trackEvent(slotID, label);

				}

				location.href = intent;

			}

		},

		unveil: function() {

			var veil = $('#Veil');

			if (veil) {

				veil.classList.add('Off');

				setTimeout(function(){veil.classList.add('Hidden');}, 500);

			}

		},

		checkForKSO: function() {

			if (window.ksoContext) {

				self.log('ksoContext loaded');
				self.isKidsFreeTime = window.ksoContext.kftActive;

				if (typeof window.init === 'function') {

					init();

				}

			} else {

				setTimeout(self.checkForKSO, 100);

			}

		},

		window_onLoad: function() {

			self.log('window loaded', true);

			self.isWindowLoaded = true;

			window.addEventListener('orientationchange', function(){self.onViewportChange();}, false);

			if (!self.isFireDevice) {

				window.addEventListener('resize', function(){self.onViewportChange();}, false);

			}

			if (self.context === 'Wake') {

				self.checkForKSO();

			} else if (typeof window.init === 'function') {

				init();

			}

		},

		log: function(message, includePerformance) {

			if (self.isDebugMode) {

				var output;

				var p = '';
				var t = new Date();
				var h = t.getHours();
				var m = t.getMinutes();
				var s = t.getSeconds();
				var ms = t.getMilliseconds();

				h =  (h / 100).toFixed(2).toString().slice(2);
				m =  (m / 100).toFixed(2).toString().slice(2);
				s =  (s / 100).toFixed(2).toString().slice(2);
				ms = (ms / 1000).toFixed(3).toString().slice(2);

				if (includePerformance && window.performance && window.performance.now) {

					p = (window.performance.now() / 1000).toFixed(3) + 's - ';

				}

				output = h + ':' + m + ':' + s + ' ' + ms + '     ' + p + message;

				if (window['console']) {

					console.log(output);

				}

				self.debugLog += output + '<br/>';

				if (window.debug && window.debug.isInitialized) {

					debug.log();

				}

			}

		}

	};

	window.pyro = window.p = window.fire = Pyro;

	pyro.init();

	window.addEventListener('load', pyro.window_onLoad, false);

})();
