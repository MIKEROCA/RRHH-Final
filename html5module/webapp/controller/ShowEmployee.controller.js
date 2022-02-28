// @ts-nocheck
sap.ui.define([
    "logaligroup/html5module/controller/Base.controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Base
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.m.MessageBox} MessageBox
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     */
    function (Base, JSONModel, MessageBox, Filter, FilterOperator) {
        "use strict";

        return Base.extend("logaligroup.html5module.controller.ShowEmployee", {

            onInit: function () {
                this._oSplitApp = this.byId("ShowEmployee");

                //Navegación
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.getRoute("ShowEmployee").attachPatternMatched(this.onObjectMatched, this);
            },

            /**
             * Navegación esta activa.
             */
            onObjectMatched: function () {

                //Resetea detalles
                this._oSplitApp.toDetail(this.byId("detail"));
            },

            /**
             * Se navega a menu principal
             */
            onNavBack: function (oEvent) {
                this.oRouter.navTo("RouteMain", true);
            },

            /**
             * Busqueda de empleado
             */
            onSearch: function (oEvent) {
                var aFilters = [];
                var sQuery = oEvent.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter({
                        filters: [
                            new Filter({
                                path: 'FirstName',
                                operator: FilterOperator.Contains,
                                value1: sQuery
                            }),
                            new Filter({
                                path: 'LastName',
                                operator: FilterOperator.Contains,
                                value1: sQuery
                            }),
                            new Filter({
                                path: 'Dni',
                                operator: FilterOperator.Contains,
                                value1: sQuery
                            })
                        ],
                        and: false
                    })
                    aFilters.push(filter);
                }

                // Se actualiza lista
                var oList = this.byId("listaEmpleados");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters, "Application");
            },

            /**
             * Se muestra detalles del empleado
             */
            onDetailsEmployee: function (oEvent) {
                var path = oEvent.getSource().getBindingContext("oDataEmployee").getPath();

                this.byId("employeeDetail").bindElement("oDataEmployee>" + path);
                this._oSplitApp.toDetail(this.byId("employeeDetail"));
                this._EmployeeId = oEvent.getSource().getBindingContext("oDataEmployee").getObject().EmployeeId;
            },

            /**
             * Baja del empleado.
             */
            onBajaEmployee: function (oEvent) {
                var contextObj = oEvent.getSource().getBindingContext("oDataEmployee").getObject();

                MessageBox.confirm(this.getText("deleteEmployee"), {
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            this._deleteEmployee(contextObj.EmployeeId);
                        }
                    }.bind(this)
                });
            },

            /**
             * Ascenso del empleado
             */
            onAscenderEmployee: function (oEvent) {

                if (!this._oDialogPromotion) {
                    this._oDialogPromotion = this.loadFragment({
                        name: "logaligroup.html5module.view.DialogAscend"
                    });
                }
                this._oDialogPromotion.then(function (oDialog) {
                    var oModel = new JSONModel([]);
                    oDialog.setModel(oModel, "ascenderModel");
                    oDialog.open();
                }.bind(this));
            },

            /**
             * Cierre del dialogo de ascenso
             */
            onCancelarAscenso: function (oEvent) {
                this.byId("ascenderDialog").close();
            },

            /**
             * Aceptar ascenso 
             */
            onAceptarAscenso: function (oEvent) {
                var oModel = this.byId("ascenderDialog").getModel("ascenderModel"),
                    oData = oModel.getData(),
                    body = {
                        Amount: parseFloat(oData.Amount).toString(),
                        Waers: "EUR",
                        CreationDate: oData.CreationDate,
                        Comments: oData.Comments,
                        SapId: this.getOwnerComponent().SapId,
                        EmployeeId: this._EmployeeId
                    }

                this.getView().getModel("oDataEmployee").create("/Salaries", body, {
                    success: function (data) {
                        sap.m.MessageToast.show(this.getText("oDataAscensoOK"));
                        this.byId("ascenderDialog").close();
                        oModel.setData(null);
                        this.getView().getModel("oDataEmployee").refresh();
                    }.bind(this),
                    error: function (error) {
                        sap.m.MessageToast.show(this.getText("oDataAscensoKO"));
                    }.bind(this)
                });
            },

            /**
             * Se elimina un elemento de la lista de archivos.
             */
            onItemRemoved: function (oEvent) {
                var sPath = oEvent.getParameter("item").getBindingContext("oDataEmployee").getPath();

                this.getView().getModel("oDataEmployee").remove(sPath, {
                    success: function (oData) {
                        sap.m.MessageToast.show(this.getText("fileDeleteOK"));
                    }.bind(this),
                    error: function (e) {
                        sap.m.MessageToast.show(this.getText("fileDeleteKO"));
                    }.bind(this)
                });

            },

            /**
             * Se agrega un elemento de la lista de archivos.
             */
            onItemAdded: function (oEvent) {
                var oItem = oEvent.getParameter("item"),
                    sEmployeeId = oItem.getBindingContext("oDataEmployee").getObject().EmployeeId,
                    oToken = new sap.ui.core.Item({
                        key: "x-csrf-token",
                        text: this.getView().getModel("oDataEmployee").getSecurityToken()
                    }),
                    oSlug = new sap.ui.core.Item({
                        key: "slug",
                        text: this.getOwnerComponent().SapId + ";" + sEmployeeId + ";" + oItem.getFileName()
                    });
                oItem.addHeaderField(oToken).addHeaderField(oSlug);
                oItem.setVisibleEdit(false);
            },

            /**
             * Cuando se completo la carga.
             */
            onUploadCompleted: function (oEvent) {
                this.getView().getModel("oDataEmployee").refresh();
            },

            /**
             * Al hacer clic en un elemento para descargarlo
             * Se Corrije el nombre del elemento de descarga con el nombre de archivo adecuado
             * Codigo de https://blogs.sap.com/2021/08/18/my-journey-towards-using-ui5-uploadset-with-cap-backend/
             */
            onOpenPressed: function (oEvent) {
                oEvent.preventDefault();
                var item = oEvent.getSource();
                this._fileName = item.getFileName();
                this._download(item)
                    .then((blob) => {
                        var url = window.URL.createObjectURL(blob);

                        //download
                        var link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', this._fileName);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },

            _download: function (item) {
                var settings = {
                    url: item.getUrl(),
                    method: "GET",
                    xhrFields: {
                        responseType: "blob"
                    }
                }

                return new Promise((resolve, reject) => {
                    $.ajax(settings)
                        .done((result, textStatus, request) => {
                            resolve(result);
                        })
                        .fail((err) => {
                            reject(err);
                        })
                });
            },




            /**
             * Se elimina desde la entidad Users la correspondiente entrada employee id
             */
            _deleteEmployee: function (sEmployeeId) {
                if (sEmployeeId) {
                    this.getView().getModel("oDataEmployee").remove("/Users(EmployeeId='" + sEmployeeId + "',SapId='" + this.getOwnerComponent().SapId + "')", {
                        success: function () {
                            sap.m.MessageToast.show(this.getText("oDataDeleteOK"));
                            this.byId("listaEmpleados").getBinding("items").refresh();
                            this._oSplitApp.toDetail(this.byId("detail"));
                        }.bind(this),
                        error: function (e) {
                            sap.m.MessageToast.show(this.getText("oDataDeleteKO"));
                        }.bind(this)
                    });
                }
            }
        });
    });
