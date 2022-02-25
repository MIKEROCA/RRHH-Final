// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("logaligroup.html5module.controller.Menu", {
            onInit: function () {
            },

            /**
             * Firmar Pedido
             */
            onSignOrder: function (oEvent) {
                const url = "https://1c829278trial-dev-logali-approuter.cfapps.us10.hana.ondemand.com";                
                window.open(url);
            },

            /**
             * Ver Empleados
             */
            onShowEmployee: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("ShowEmployee", true);
            },

            /**
             * Crear Empleado
             */
            onNewEmployee: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("CreateEmployee", true);
            }

        });
    });