(function () {
    angular.module('App')
        .component('approveSection', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/approve-section/approve-section.view.html?rnd' + Math.random(),
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
        // ctrl.$Attachments = [];
        ctrl.formData = {};
        ctrl.internalControls = [];

        function loadData() {
            var req = {
                // allSection: $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title&$expand=BCMTitle'),
                section: $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title,Assignee/Title,Assignee/EMail,Assignee/Id&$expand=BCMTitle,Assignee&$filter=Id eq ' + $routeParams.id),
                internalControls: $ApiService.getListItems('Internal Controls', '$select=*,BCMSection/Title&$expand=BCMSection&$filter=BCMSectionId eq ' + $routeParams.id),
                // attachments: $ApiService.getListItems('BCM Sections Attachments', '$expand=File&$filter=BCMSectionId eq \'' + $routeParams.id + '\' and AttachmentType eq \'Section\''),
                checklistAttachments: $ApiService.getListItems('BCM Sections Attachments', '$expand=File&$filter=BCMSectionId eq \'' + $routeParams.id + '\' and AttachmentType eq \'Checklist\'')
            };
            $q.all(req).then(function (reqRes) {
                if (reqRes.section.length) {
                    ctrl.formData = reqRes.section[0];
                    ctrl.formData.BCMApprovedDate = ctrl.formData.BCMApprovedDate ? new Date(ctrl.formData.BCMApprovedDate) : null;
                    ctrl.internalControls = reqRes.internalControls;
                    // reqRes.attachments.forEach(function (file) {
                    //     ctrl.$Attachments.push({
                    //         $file: {
                    //             name: file.File.Name
                    //         },
                    //         url: file.ServerRedirectedEmbedUri || file.File.ServerRelativeUrl,
                    //         item: file
                    //     });
                    // });
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
                }
                else {
                    $Preload.hide();
                }
            });
        }
        loadData();



        ctrl.approve = function () {
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
                BCMApprovedDate: ctrl.formData.BCMApprovedDate.toISOString(),
                BCMSectionUpdate: ctrl.formData.BCMSectionUpdate,
                Comments: ctrl.formData.Comments,
                Status: 'Completed',
                Stage: 'Approved',
                __metadata: { "type": 'SP.Data.BCMSectionsListItem' }
            };
            $ApiService.updateListItem('BCM Sections', ctrl.formData.Id, data).then(function (res) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        $Preload.hide();
                        $location.path('/approve-dashboard');
                    });
                }, 0);
            });
        }

        ctrl.reject = function () {
            $Preload.show();
            var data = {
                BCMSectionUpdate: ctrl.formData.BCMSectionUpdate,
                Comments: ctrl.formData.Comments,
                Stage: 'Assigned',
                __metadata: { "type": 'SP.Data.BCMSectionsListItem' }
            };
            $ApiService.updateListItem('BCM Sections', ctrl.formData.Id, data).then(function (res) {
                $EmailService.sendRejectedEmail(ctrl.formData).then(function () {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $Preload.hide();
                            $location.path('/approve-dashboard');
                        });
                    }, 0);
                });
            });
        }

        ctrl.toHtml = function (string) {
            return string ? string.replace(/\n/g, '<br/>') : '';
        }
    }
})();