// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("logaligroup.html5module.controller.Base", {

            onInit: function () {
            },

            getText: function (sText) {
                return this.getView().getModel("i18n").getResourceBundle().getText(sText);
            }
        });
    });
