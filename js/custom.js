// init is called from pyro.js when page load is complete
function init() {
	pyro.log("template initialization", true);
	initSettings();
	initButtons();
	initState();
}
function initSettings() {
	window.global = window.global || {};
	global.device = pyro.device;
	window.elements = window.elements || {};
	elements.$body = $("body");
}
function initButtons() {
	elements.$body.on(pyro.PRESS, function(){});
}
function initState() {
	pyro.log("template built", true);
	pyro.unveil();
	var landscape = pyro.deviceImage('images/83651_Carosel_l_background.jpg', 'prefix');
	var portrait = pyro.deviceImage('images/83651_Carosel_p_background.jpg', 'prefix');
	
	pyro.preload([landscape, portrait], function(){pyro.log('success!');});

	pyro.trackEvent('1000', 'Page Loaded');

	$("#detail").on(pyro.TAP, function(){
		pyro.trackEvent('1001', 'Tile-1 Clicked');
		pyro.launchIntent({'type': 'Product Detail', 'asin': 'B01BDWQHT6'});
	});

	$("#landing").on(pyro.TAP, function(){
		pyro.trackEvent('1002', 'Tile-2 Clicked');
		pyro.launchIntent({'type': 'Link Out', 'url': 'https://www.amazon.com/gp/adlp/MAKERKitchen'});
	});

	$("#video").on(pyro.TAP, function(){
		pyro.trackEvent('1003', 'Tile-3 Clicked');
		pyro.launchIntent({'type': 'Video URL', 'url': 'videos/1.mp4'});
	});

	$("#app").on(pyro.TAP, function(){
		pyro.trackEvent('1004', 'Tile-4 Clicked');
		pyro.launchIntent({'type': 'App Detail', 'asin': 'B00C25OI36'});
	});
}
