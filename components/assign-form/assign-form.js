(function () {
    angular.module('App')
        .component('assignForm', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/assign-form/assign-form.view.html?rnd' + Math.random(),
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
        ctrl.$AttachmentsFiles = [];
        ctrl.formData = {
            BCMDueDate: new Date()
        };
        ctrl.bcmItems = [];
        ctrl.sections = [];
        ctrl.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };

        function loadData() {
            $Preload.show();

            //get data if form created
            if ($routeParams.bcmid) {
                var formReq = {
                    bcmItems: $ApiService.getListItems('Business Process Areas', ''),
                    sections: $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title,BCMTitle/Id,Assignee/Title,Assignee/Id,Assignee/EMail&$expand=BCMTitle,Assignee&$filter=BCMID eq \'' + $routeParams.bcmid + '\''),
                    attachments: $ApiService.getListItems('BCM Sections Attachments', '$expand=File&$filter=BCMID eq \'' + $routeParams.bcmid + '\' and AttachmentType eq \'Assign\'')
                };
                $q.all(formReq).then(function (res) {
                    ctrl.bcmItems = res.bcmItems;
                    if (res.sections.length) {
                        ctrl.formData = {
                            BCMID: res.sections[0].BCMID,
                            BCMTitle: res.sections[0].BCMTitle,
                            BCMDueDate: new Date(res.sections[0].BCMDueDate),
                        };
                        ctrl.sections = res.sections;
                        if (res.attachments.length) {
                            res.attachments.forEach(function (file) {
                                ctrl.$AttachmentsFiles.push({
                                    $file: {
                                        name: file.File.Name
                                    },
                                    url: file.ServerRedirectedEmbedUri || file.File.ServerRelativeUrl,
                                    item: file
                                });
                            });
                            $Preload.hide();
                        }
                        else {
                            $Preload.hide();
                        }
                    }
                    else {
                        $Preload.hide();
                    }
                });
            }
            else {
                $ApiService.getListItems('Business Process Areas', '$filter=BCMStatus eq \'Complete\' or BCMStatus eq null').then(function (res) {
                    ctrl.bcmItems = res;
                    $Preload.hide();
                });
            }
        }
        loadData();

        ctrl.openSectionModal = function (item) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/section-modal/section-modal.view.html?rnd' + Math.random(),
                controller: 'sectionModalCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    item: function () {
                        return item;
                    }
                }
            });

            modalInstance.result.then(function (item) {
                ctrl.sections.push(item);
            }, function () {
            });
        };

        ctrl.updateSection = function (index) {
            var editedItem = ctrl.sections[index];
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/section-modal/section-modal.view.html?rnd' + Math.random(),
                controller: 'sectionModalCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    item: function () {
                        return editedItem;
                    }
                }
            });

            modalInstance.result.then(function (item) {
                ctrl.sections[index] = item;
            }, function () {
            });
        }

        ctrl.deleteSection = function (index) {
            var removedItem = ctrl.sections[index];
            if (removedItem.Id) {
                $Preload.show();
                $ApiService.deleteListItem("BCM Sections", removedItem.Id).then(function (res) {
                    // loadData();

                    setTimeout(function () {
                        ctrl.sections.splice(index, 1);
                        $Preload.hide();
                        $scope.$apply();
                    }, 0);

                });
            }
            else {
                ctrl.sections.splice(index, 1);
            }
        }

        ctrl.deleteFile = function (index) {
            var deletedFile = ctrl.$AttachmentsFiles[index];
            if (deletedFile.item && deletedFile.item.Id) {
                $Preload.show();
                $ApiService.deleteListItem("BCM Sections Attachments", deletedFile.item.Id).then(function (res) {
                    setTimeout(function () {
                        ctrl.$AttachmentsFiles.splice(index, 1);
                        $Preload.hide();
                        $scope.$apply();
                    }, 0);

                });
            }
            else {
                ctrl.$AttachmentsFiles.splice(index, 1);
                setTimeout(function () {
                    $scope.$apply();
                }, 0);
            }
        }

        ctrl.save = function (isSubmit) {
            if (ctrl.sections.length === 0) return;
            if (ctrl.form.$invalid) {
                angular.forEach(ctrl.form.$error, function (field) {
                    angular.forEach(field, function (errorField) {
                        errorField.$setTouched();
                    });
                });
                return;
            }
            $Preload.show();
            var req = [
                $ApiService.updateListItem('Business Process Areas', ctrl.formData.BCMTitle.Id, {
                    BCMStatus: 'New',
                    '__metadata': { "type": 'SP.Data.processareasListItem' }
                })
            ];
            ctrl.sections.forEach(function (item, key) {
                ctrl.sections[key].BCMID = ctrl.formData.BCMID;
                let newItem = angular.copy(item);
                newItem.BCMID = ctrl.formData.BCMID;
                newItem.BCMTitleId = ctrl.formData.BCMTitle.Id;
                newItem.BCMDueDate = ctrl.formData.BCMDueDate.toISOString();
                newItem.Status = 'In Progress';
                newItem.Stage = 'Assigned';
                newItem.AssigneeId = newItem.Assignee.Id;
                delete newItem.Assignee;
                newItem['__metadata'] = { "type": 'SP.Data.BCMSectionsListItem' };
                req.push(newItem.Id ? $ApiService.updateListItem('BCM Sections', newItem.Id, newItem) : $ApiService.saveData('BCM Sections', newItem));
            });
            $q.all(req).then(function (res) {
                if (ctrl.$AttachmentsFiles && ctrl.$AttachmentsFiles.length) {
                    var filesReq = [];
                    ctrl.$AttachmentsFiles.forEach(function (file) {
                        if (!file.url) {
                            filesReq.push($ApiService.uploadFile('BCM Sections Attachments', file.$file, {
                                BCMID: ctrl.formData.BCMID,
                                AttachmentType: 'Assign',
                                __metadata: { "type": 'SP.Data.BCMSectionsAttachmentsItem' }
                            }));
                        }
                    });
                    $q.all(filesReq).then(function (fileRes) {
                        if (isSubmit) {
                            $EmailService.sendAssignorEmail(ctrl.sections).then(function () {
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $Preload.hide();
                                        $location.path('/assign-form-dashboard');
                                    });
                                }, 0);
                            });
                        }
                        else {
                            $Preload.hide();
                            $location.path('/assign-form-dashboard');
                        }
                    });
                }
                else {
                    if (isSubmit) {
                        $EmailService.sendAssignorEmail(ctrl.sections).then(function () {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $Preload.hide();
                                    $location.path('/assign-form-dashboard');
                                });
                            }, 0);
                        });
                    }
                    else {
                        $Preload.hide();
                        $location.path('/assign-form-dashboard');
                    }
                }

            });
        }

        ctrl.parseByteToMB = function (bytes) {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }

    }
})();