// @ts-nocheck
sap.ui.define([
    "logaligroup/html5module/controller/Base.controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "logaligroup/html5module/model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Base
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.m.MessageBox} MessageBox
     */
    function (Base, JSONModel, MessageBox, formatter) {
        "use strict";

        return Base.extend("logaligroup.html5module.controller.CreateEmployee", {
            formatter: formatter,

            onInit: function () {

                this._oWizard = this.byId("empleadoWizard");
                this._oNavContainer = this.byId("wizardNavContainer");
                this._oWizardContentPage = this.byId("CreateEmployee");

                this.employeeModel = new JSONModel();
                this.employeeModel.setData({
                    nombreState: "Error",
                    apellidosState: "Error",
                    dniState: "Error",
                    dateState: "Error"
                });
                this.getView().setModel(this.employeeModel, "employeeModel");

                //Navegación
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.getRoute("CreateEmployee").attachPatternMatched(this.onObjectMatched, this);
            },

            /**
             * Navegación activa.
             */
            onObjectMatched: function () {
                //Reiniciar wizard
                this._resetWizard();
            },

            /**
             * Cancelar, retorna a menu principal.
             */
            onCancel: function (oEvent) {
                this.oRouter.navTo("RouteMain", true);
            },

            /**
             * Se presiono el botón para Interno.
             * Se Quita la presión de otros botones y se establece el tipo en 0 y la configuración del control deslizante. Ir al siguiente paso.
             */
            onInternoPress: function (oEvent) {
                this.byId("autonomo").setPressed(false);
                this.byId("gerente").setPressed(false);
                this.employeeModel.setProperty("/Type", 0);
                this._updateSliderSettings(this.getI18nText("salarioBrutoAnual"), 12000, 80000, 24000, 1000);
                this.byId("dniEmpleado").fireLiveChange();
                if (this._oWizard.getProgressStep() === this.byId("tipoEmpleado")) {
                    this._oWizard.nextStep();
                }
            },

            /**
             * Se presiono el botón de Autonomo.
             * Se quita la presión de otros botones y se establece el tipo en 1 y la configuración del control deslizante. Ir al siguiente paso.
             */
            onAutonomoPress: function (oEvent) {
                this.byId("interno").setPressed(false);
                this.byId("gerente").setPressed(false);
                this.employeeModel.setProperty("/Type", 1);
                this._updateSliderSettings(this.getI18nText("precioDiario"), 100, 2000, 400, 50);
                this.byId("dniEmpleado").fireLiveChange();
                if (this._oWizard.getProgressStep() === this.byId("tipoEmpleado")) {
                    this._oWizard.nextStep();
                }
            },

            /**
             * Se presiono el botón de Gerente.
             * Se quita la presión de otros botones y se establece el tipo en 3 y la configuración del control deslizante. Ir al siguiente paso.
             */
            onGerentePress: function (oEvent) {
                this.byId("interno").setPressed(false);
                this.byId("autonomo").setPressed(false);
                this.employeeModel.setProperty("/Type", 2);
                this._updateSliderSettings(this.getI18nText("salarioBrutoAnual"), 12000, 80000, 24000, 1000);
                this.byId("dniEmpleado").fireLiveChange();
                if (this._oWizard.getProgressStep() === this.byId("tipoEmpleado")) {
                    this._oWizard.nextStep();
                }
            },

            /**
             * Se cambia el Nombre.
             * Validar el estado y comprobar si se puede validar el paso.
             */
            onNombreChange: function (oEvent) {
                if (!oEvent.getSource().getValue()) {
                    this.employeeModel.setProperty("/nombreState", "Error");
                } else {
                    this.employeeModel.setProperty("/nombreState", "None");
                }

                this._checkEmployeeDataStep(this._oWizard.getCurrentStep());
            },

            /**
             * Se cambia Apellidos.
             * Validar el estado y comprobar si se puede validar el paso.
             */
            onApellidosChange: function (oEvent) {
                if (!oEvent.getSource().getValue()) {
                    this.employeeModel.setProperty("/apellidosState", "Error");
                } else {
                    this.employeeModel.setProperty("/apellidosState", "None");
                }

                this._checkEmployeeDataStep(this._oWizard.getCurrentStep());
            },

            /**
             * Se cambia Dni/Cif.
             * Validar el estado y comprobar si se puede validar el paso.
             */
            onDniChange: function (oEvent) {
                var dni = oEvent.getParameter("value"),
                    number,
                    letter,
                    letterList,
                    regularExp = /^\d{8}[a-zA-Z]$/,
                    tipo = this.employeeModel.getProperty("/Type");

                if (dni === undefined) {
                    dni = this.byId("dniEmpleado").getValue();
                }

                if (dni === "") {
                    this.byId("dniEmpleado").setValueStateText(this.getI18nText("campoObligatorio"));
                    this.employeeModel.setProperty("/dniState", "Error");
                } else {
                    if (tipo !== 1) {
                        //Se comprueba que el formato es válido
                        if (regularExp.test(dni) === true) {
                            //Número
                            number = dni.substr(0, dni.length - 1);
                            //Letra
                            letter = dni.substr(dni.length - 1, 1);
                            number = number % 23;
                            letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                            letterList = letterList.substring(number, number + 1);
                            if (letterList !== letter.toUpperCase()) {
                                this.employeeModel.setProperty("/dniState", "Error");
                                this.byId("dniEmpleado").setValueStateText(this.getI18nText("dniIncorrecto"));
                            } else {
                                this.employeeModel.setProperty("/dniState", "None");
                            }
                        } else {
                            this.employeeModel.setProperty("/dniState", "Error");
                            this.byId("dniEmpleado").setValueStateText(this.getI18nText("dniIncorrecto"));
                        }
                    } else {
                        this.employeeModel.setProperty("/dniState", "None");
                    }
                }
                this._checkEmployeeDataStep(this._oWizard.getCurrentStep());
            },

            /**
             * Se cambia DP Fecha de incorporación.
             * Validar el estado y comprobar si se puede validar el paso.
             */
            onDateChange: function (oEvent) {
                if (!oEvent.getSource().getValue()) {
                    this.employeeModel.setProperty("/dateState", "Error");
                } else {
                    this.employeeModel.setProperty("/dateState", "None");
                }
                this._checkEmployeeDataStep(this._oWizard.getCurrentStep());
            },

            /**
             * Se completan todos los pasos del asistente.
             * Obtenga una lista de archivos incompletos y navegue a la página de revisión.
             */
            onWizardComplete: function (oEvent) {
                var oPendingFiles = this.byId("ficherosAdicional").getIncompleteItems(),
                    sFileNames = "";

                if (oPendingFiles.length > 0) {
                    for (let index = 0; index < oPendingFiles.length; index++) {
                        sFileNames = sFileNames + oPendingFiles[index].getFileName() + "\n";
                    }
                }
                this.employeeModel.setProperty("/fileList", sFileNames);
                this._oNavContainer.to(this.byId("wizardReviewPage"));
            },

            /**
             * Al editar el paso uno.
             */
            editStepOne: function () {
                this._handleNavigationToStep(0);
            },

            /**
             * Al editar el paso dos.
             */
            editStepTwo: function () {
                this._handleNavigationToStep(1);
            },

            /**
              * Al editar el paso tres.
             */
            editStepThree: function () {
                this._handleNavigationToStep(2);
            },

            /**
             * Al cancelar la página de revisión.
             */
            onWizardCancel: function (oEvent) {
                MessageBox.warning(this.getI18nText("cancelarMsg"), {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            this._resetWizard();
                        }
                    }.bind(this)
                });
            },

            /**
             * Cuando envíe el wizard.
             * Se llama a la función de creación del servicio OData
             */
            onWizardSubmit: function (oEvent) {
                MessageBox.warning(this.getI18nText("submitMsg"), {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            this._saveEmployee();
                        }
                    }.bind(this)
                });
            },


            /*****************************************************
             * FUNCIONES LOCALES
             *****************************************************

            /**
             * Resetea todo el wizard
             */
            _resetWizard: function () {
                this._handleNavigationToStep(0);
                this._oWizard.discardProgress(this._oWizard.getSteps()[0]);
                this.byId("tipoEmpleado").setValidated(false);
                this.byId("interno").setPressed(false);
                this.byId("autonomo").setPressed(false);
                this.byId("gerente").setPressed(false);
                this.employeeModel.setData({
                    nombreState: "Error",
                    apellidosState: "Error",
                    dniState: "Error",
                    dateState: "Error"
                });
                this.byId("ficherosAdicional").destroyItems();
                this.byId("ficherosAdicional").destroyIncompleteItems();
            },

            /**
             * Setea el wizard al número correspondiente .
             */
            _handleNavigationToStep: function (iStepNumber) {
                var fnAfterNavigate = function () {
                    this._oWizard.goToStep(this._oWizard.getSteps()[iStepNumber]);
                    this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
                }.bind(this);

                this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
                this._oNavContainer.backToPage(this._oWizardContentPage.getId());
            },

            /**
             * Actualice la configuración del control deslizante con parámetros de entrada.
             */
            _updateSliderSettings: function (sText, iMin, iMax, iValue, iStep) {
                this.employeeModel.setProperty("/sliderText", sText);
                this.employeeModel.setProperty("/sliderMin", iMin);
                this.employeeModel.setProperty("/sliderMax", iMax);
                this.employeeModel.setProperty("/Amount", iValue);
                this.employeeModel.setProperty("/sliderStep", iStep);
            },

            /**
             * Revisa datos del paso del empleado
             */
            _checkEmployeeDataStep: function (oStepId) {
                var oData = this.employeeModel.getData();
                if (oData.nombreState === "None" &&
                    oData.apellidosState === "None" &&
                    oData.dniState === "None" &&
                    oData.dateState === "None") {

                    this.byId(oStepId).setValidated(true);
                }
                else {
                    this.byId(oStepId).setValidated(false);
                }
            },

            /**
             * Guarda el empleado
             */
            _saveEmployee: function () {
                var employeeData = this.employeeModel.getData();

                var body = {
                    SapId: this.getOwnerComponent().SapId,
                    Type: employeeData.Type.toString(),
                    FirstName: employeeData.FirstName,
                    LastName: employeeData.LastName,
                    Dni: employeeData.Dni,
                    CreationDate: employeeData.CreationDate,
                    Comments: employeeData.Comments,
                    UserToSalary: [
                        {
                            Amount: parseFloat(employeeData.Amount).toString(),
                            Comments: employeeData.Comments,
                            Waers: "EUR"
                        }
                    ]
                }

                new Promise((resolve, reject) => {
                    this.getView().getModel("oDataEmployee").create("/Users", body, {
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (error) {
                            reject(error);
                        }
                    });
                }).then(
                    function (data) {
                        this._uploadFiles(data.EmployeeId);
                        MessageBox.success(this.getView().getModel("i18n").getResourceBundle().getText("EmployeeCreated") + ": " + data.EmployeeId, {
                            onClose: function () {
                                this.oRouter.navTo("RouteMain", true);
                            }.bind(this)
                        });
                    }.bind(this),
                    function (error) {
                        MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("employeeNotCreated") + "\n" + error);

                    }.bind(this));
            },

            /**
             * Sube los archivos para los empleados
             */
            _uploadFiles: function (sEmployeeId) {

                var oUploadSet = this.byId("ficherosAdicional"),
                    oPendingFiles = oUploadSet.getIncompleteItems(),
                    oHeaderField;

                for (let index = 0; index < oPendingFiles.length; index++) {
                    if (oPendingFiles.length > 0) {
                        oUploadSet.removeAllHeaderFields();
                        oHeaderField = new sap.ui.core.Item({
                            key: "x-csrf-token",
                            text: this.getView().getModel("oDataEmployee").getSecurityToken()
                        });
                        oUploadSet.addHeaderField(oHeaderField);

                        oHeaderField = new sap.ui.core.Item({
                            key: "slug",
                            text: this.getOwnerComponent().SapId + ";" + sEmployeeId + ";" + oPendingFiles[index].getFileName()
                        });
                        oUploadSet.addHeaderField(oHeaderField);
                        oUploadSet.uploadItem(oPendingFiles[index]);
                    }
                }
            }
        });
    });
