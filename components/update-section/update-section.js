(function () {
    angular.module('App')
        .component('updateSection', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/update-section/update-section.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$ApiService', '$uibModal', '$Preload', '$q', '$location', '$routeParams', '$scope', '$EmailService', ctrl]
        });

    function ctrl($ApiService, $uibModal, $Preload, $q, $location, $routeParams, $scope, $EmailService) {
        $Preload.show();
        var ctrl = this;
        ctrl.$routeParams = $routeParams;
        ctrl.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };
        ctrl.$ChecklistAttachment = [];
        ctrl.$Attachments = [];
        ctrl.formData = {
        };
        ctrl.selectedBCMData = {};
        ctrl.bcmSections = [];
        ctrl.internalControls = [];

        function loadData() {
            $ApiService.getCurrentUser().then(function (user) {
                $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title,BCMTitle/Id,Author/Title,Author/EMail&$expand=BCMTitle,Author&$filter=AssigneeId eq ' + user.Id).then(function (res) {
                    ctrl.bcmSections = res.map(function (item) {
                        item.BCMDueDate = new Date(item.BCMDueDate);
                        item.BCMUpdateDate = item.BCMUpdateDate ? new Date(item.BCMUpdateDate) : new Date();
                        return item;
                    });
                    if ($routeParams.id) {
                        ctrl.formData = ctrl.bcmSections.filter(function (x) {
                            return x.BCMID === $routeParams.id;
                        })[0];
                        var req = {
                            internalControls: $ApiService.getListItems('Internal Controls', '$select=*,BCMSection/Title&$expand=BCMSection&$filter=BCMSectionId eq ' + ctrl.formData.Id),
                            attachments: $ApiService.getListItems('BCM Sections Attachments', '$expand=File&$filter=BCMSectionId eq \'' + ctrl.formData.Id + '\' and AttachmentType eq \'Section\''),
                            checklistAttachments: $ApiService.getListItems('BCM Sections Attachments', '$expand=File&$filter=BCMSectionId eq \'' + ctrl.formData.Id + '\' and AttachmentType eq \'Checklist\'')
                        };
                        $q.all(req).then(function (reqRes) {
                            ctrl.internalControls = reqRes.internalControls;
                            reqRes.attachments.forEach(function (file) {
                                ctrl.$Attachments.push({
                                    $file: {
                                        name: file.File.Name
                                    },
                                    url: file.ServerRedirectedEmbedUri || file.File.ServerRelativeUrl,
                                    item: file
                                });
                            });
                            reqRes.checklistAttachments.forEach(function (file) {
                                ctrl.$ChecklistAttachment.push({
                                    $file: {
                                        name: file.File.Name
                                    },
                                    url: file.ServerRedirectedEmbedUri || file.File.ServerRelativeUrl,
                                    item: file
                                });
                            });
                            $Preload.hide();
                        });
                    }
                    else {
                        $Preload.hide();
                    }
                });
            });
        }
        loadData();

        ctrl.openInternalControlModal = function (item) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/internal-control-modal/internal-control-modal.view.html?rnd' + Math.random(),
                controller: 'internalControlModalCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    item: function () {
                        return item;
                    }
                }
            });

            modalInstance.result.then(function (item) {
                ctrl.internalControls.push(item);
            }, function () {
            });
        };

        ctrl.updateInternalControl = function (index) {
            var editedItem = ctrl.internalControls[index];
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/internal-control-modal/internal-control-modal.view.html?rnd' + Math.random(),
                controller: 'internalControlModalCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    item: function () {
                        return editedItem;
                    }
                }
            });

            modalInstance.result.then(function (item) {
                ctrl.internalControls[index] = item;
            }, function () {
            });
        }

        ctrl.deleteInternalControl = function (index) {
            var removedItem = ctrl.internalControls[index];
            if (removedItem.Id) {
                $Preload.show();
                $ApiService.deleteListItem("Internal Controls", removedItem.Id).then(function (res) {
                    // loadData();

                    setTimeout(function () {
                        ctrl.internalControls.splice(index, 1);
                        $Preload.hide();
                        $scope.$apply();
                    }, 0);

                });
            }
            else {
                ctrl.internalControls.splice(index, 1);
            }
        }

        ctrl.removeChecklistAttachment = function () {
            if (ctrl.$ChecklistAttachment[0].item && ctrl.$ChecklistAttachment[0].item.Id) {
                $Preload.show();
                $ApiService.deleteListItem("BCM Sections Attachments", ctrl.$ChecklistAttachment[0].item.Id).then(function (res) {
                    setTimeout(function () {
                        ctrl.$ChecklistAttachment = [];
                        $Preload.hide();
                        $scope.$apply();
                    }, 0);

                });
            }
            else {
                ctrl.$ChecklistAttachment.splice(0, 1);
                setTimeout(function () {
                    $scope.$apply();
                }, 0);
            }
        }

        ctrl.removeAttachment = function (index) {
            var deletedFile = ctrl.$Attachments[index];
            if (deletedFile.item && deletedFile.item.Id) {
                $Preload.show();
                $ApiService.deleteListItem("BCM Sections Attachments", deletedFile.item.Id).then(function (res) {
                    setTimeout(function () {
                        ctrl.$Attachments.splice(index, 1);
                        $Preload.hide();
                        $scope.$apply();
                    }, 0);

                });
            }
            else {
                ctrl.$Attachments.splice(index, 1);
                setTimeout(function () {
                    $scope.$apply();
                }, 0);
            }
        }

        ctrl.save = function (isSubmit) {
            if (ctrl.form.$invalid) {
                angular.forEach(ctrl.form.$error, function (field) {
                    angular.forEach(field, function (errorField) {
                        errorField.$setTouched();
                    });
                });
                return;
            }
            $Preload.show();
            var data = {
                KeyStakeholders: ctrl.formData.KeyStakeholders,
                BCMUpdateDate: ctrl.formData.BCMUpdateDate.toISOString(),
                BCMChecklistUpdated: ctrl.formData.BCMChecklistUpdated,
                BCMSectionUpdate: ctrl.formData.BCMSectionUpdate,
                Stage: 'Submitted',
                __metadata: { "type": 'SP.Data.BCMSectionsListItem' }
            };
            $ApiService.updateListItem('BCM Sections', ctrl.formData.Id, data).then(function (res) {

                var req = [
                    $ApiService.updateListItem('Business Process Areas', ctrl.formData.BCMTitle.Id, {
                        BCMStatus: 'In Progress',
                        '__metadata': { "type": 'SP.Data.processareasListItem' }
                    })
                ];
                ctrl.internalControls.forEach(function (item) {
                    let newItem = angular.copy(item);
                    newItem.BCMSectionId = ctrl.formData.Id;
                    newItem['__metadata'] = { "type": 'SP.Data.InternalControlsListItem' };
                    req.push(newItem.Id ? $ApiService.updateListItem('Internal Controls', newItem.Id, newItem) : $ApiService.saveData('Internal Controls', newItem));
                });
                $q.all(req).then(function () {
                    var filesReq = [];
                    if (ctrl.$ChecklistAttachment && ctrl.$ChecklistAttachment.length) {
                        ctrl.$ChecklistAttachment.forEach(function (file) {
                            if (!file.url) {
                                filesReq.push($ApiService.uploadFile('BCM Sections Attachments', file.$file, {
                                    BCMSectionId: ctrl.formData.Id,
                                    AttachmentType: 'Checklist',
                                    __metadata: { "type": 'SP.Data.BCMSectionsAttachmentsItem' }
                                }));
                            }
                        });
                    }
                    if (ctrl.$Attachments && ctrl.$Attachments.length) {
                        ctrl.$Attachments.forEach(function (file) {
                            if (!file.url) {
                                filesReq.push($ApiService.uploadFile('BCM Sections Attachments', file.$file, {
                                    BCMSectionId: ctrl.formData.Id,
                                    AttachmentType: 'Section',
                                    __metadata: { "type": 'SP.Data.BCMSectionsAttachmentsItem' }
                                }));
                            }
                        });
                    }
                    if (filesReq.length) {
                        $q.all(filesReq).then(function (fileRes) {
                            if (isSubmit) {
                                $EmailService.sendAssigneeEmail(ctrl.formData).then(function () {
                                    setTimeout(function () {
                                        $scope.$apply(function () {
                                            $Preload.hide();
                                            $location.path('/my-assigned-forms-dashboard');
                                        });
                                    }, 0);
                                });
                            }
                            else {
                                $Preload.hide();
                                $location.path('/my-assigned-forms-dashboard');
                            }
                        });
                    }
                    else {
                        if (isSubmit) {
                            $EmailService.sendAssigneeEmail(ctrl.formData).then(function () {
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $Preload.hide();
                                        $location.path('/my-assigned-forms-dashboard');
                                    });
                                }, 0);
                            });
                        }
                        else {
                            $Preload.hide();
                            $location.path('/my-assigned-forms-dashboard');
                        }
                    }
                });
            });
        }

        ctrl.changeBCMId = function () {
            $location.path('/update-section/' + ctrl.formData.BCMID);
        }

        ctrl.toHtml = function (string) {
            return string ? string.replace(/\n/g, '<br/>') : '';
        }

        ctrl.parseByteToMB = function (bytes) {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    }
})();