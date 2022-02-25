/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"logaligroup/html5module/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
