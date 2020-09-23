(function () {
    angular.module('App')
        .component('assignForm', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/app/components/assign-form/assign-form.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$ApiService', '$uibModal', '$Preload', '$q', '$location', ctrl]
        });

    function ctrl($ApiService, $uibModal, $Preload, $q, $location) {
        $Preload.show();
        var ctrl = this;
        ctrl.$AttachmentsFiles = [];
        ctrl.formData = {};
        ctrl.bcmItems = [];
        ctrl.sections = [];
        ctrl.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };

        $ApiService.getListItems('Business Cycle Memos', '').then(function (res) {
            ctrl.bcmItems = res;
            $Preload.hide();
        });

        ctrl.openSectionModal = function (item) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/app/components/section-modal/section-modal.view.html?rnd' + Math.random(),
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

        ctrl.submit = function () {
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
            var req = [];
            ctrl.sections.forEach(function (item) {
                let newItem = angular.copy(item);
                newItem.BCMID = ctrl.formData.BCMID;
                newItem.BCMTitleId = ctrl.formData.BCMTitle.Id;
                newItem.BCMDueDate = ctrl.formData.BCMDueDate.toISOString();
                newItem.AssigneeId = newItem.Assignee.Id;
                delete newItem.Assignee;
                newItem['__metadata'] = { "type": 'SP.Data.BCMSectionsListItem' };
                req.push($ApiService.saveData('BCM Sections', newItem));
            });
            $q.all(req).then(function (res) {
                if (ctrl.$AttachmentsFiles && ctrl.$AttachmentsFiles.length) {
                    var filesReq = [];
                    ctrl.$AttachmentsFiles.forEach(function (file) {
                        filesReq.push($ApiService.uploadFile('BCM Sections Attachments', file.$file));
                    });
                    $q.all(filesReq).then(function (fileRes) {
                        $Preload.hide();
                        $location.path('/bcm-dashboard');
                        // console.log(fileRes);
                        // filesReq = [];
                        // fileRes.forEach(function (file) {
                        //     filesReq.push($ApiService.updateListItem('BCM Sections Attachments', file.ListItemAllFields.Id, { BCMIDId: 5, __metadata: { "type": 'SP.Data.BCMSectionsAttachmentsItem' } }));
                        // });
                        // $q.all(filesReq).then(function (fileRes) {
                        //     console.log(fileRes);
                        // });
                    });
                }
                else {
                    $Preload.hide();
                    $location.path('/bcm-dashboard');
                }
            });
        }

        ctrl.parseByteToMB = function (bytes) {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }

    }
})();