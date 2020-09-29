(function () {
    angular.module('App')
        .component('publishSections', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/publish-sections/publish-sections.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$ApiService', '$uibModal', '$Preload', '$q', '$location', '$routeParams', '$scope', '$EmailService', ctrl]
        });

    function ctrl($ApiService, $uibModal, $Preload, $q, $location, $routeParams, $scope, $EmailService) {
        $Preload.show();
        var ctrl = this;
        ctrl.formData = {};
        ctrl.allSections = [];
        ctrl.allInternalControls = [];
        ctrl.$DraftBCMAttachment = [];
        ctrl.$Attachments = [];
        ctrl.FinalApproverComments = '';

        function loadData() {
            $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title&$expand=BCMTitle&$filter=BCMID eq \'' + $routeParams.id + '\'').then(function (res) {
                ctrl.formData = res;
                ctrl.FinalApproverComments = ctrl.formData[0].FinalApproverComments;
                var req = {
                    internalControls: $ApiService.getListItems('Internal Controls', '$select=*,BCMSection/Title&$expand=BCMSection&$filter=' + createSectionIdFilterValue(res)),
                    allSections: $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title&$expand=BCMTitle'),
                    attachments: $ApiService.getListItems('BCM Sections Attachments', '$expand=File&$filter=(' + createSectionIdFilterValue(res) + ') and AttachmentType eq \'Section\''),
                    draftBCMAttachment: $ApiService.getListItems('BCM Sections Attachments', '$expand=File&$filter=BCMID eq \'' + $routeParams.id + '\' and AttachmentType eq \'Draft BCM\''),
                };
                $q.all(req).then(function (reqRes) {
                    ctrl.allSections = groupBy(reqRes.allSections, 'BCMID');
                    ctrl.allInternalControls = reqRes.internalControls;
                    reqRes.draftBCMAttachment.forEach(function (file) {
                        ctrl.$DraftBCMAttachment.push({
                            $file: {
                                name: file.File.Name
                            },
                            url: file.ServerRedirectedEmbedUri || file.File.ServerRelativeUrl,
                            item: file
                        });
                    });
                    reqRes.attachments.forEach(function (file) {
                        ctrl.$Attachments.push({
                            $file: {
                                name: file.File.Name
                            },
                            url: file.ServerRedirectedEmbedUri || file.File.ServerRelativeUrl,
                            item: file,
                            BCMSectionId: file.BCMSectionId
                        });
                    });
                    ctrl.$Attachments = groupBy(ctrl.$Attachments, 'BCMSectionId');
                    $Preload.hide();
                });
            });
        }

        loadData();

        ctrl.changeBCMId = function () {
            $location.path('/publish-sections/' + ctrl.formData[0].BCMID);
        }
        ctrl.toHtml = function (string) {
            return string ? string.replace(/\n/g, '<br/>') : '';
        }

        ctrl.publish = function () {
            // if (ctrl.form.$invalid) {
            //     angular.forEach(ctrl.form.$error, function (field) {
            //         angular.forEach(field, function (errorField) {
            //             errorField.$setTouched();
            //         });
            //     });
            //     return;
            // }
            $Preload.show();

            var req = [];
            var data = {
                FinalApproverComments: ctrl.FinalApproverComments,
                Stage: 'Published',
                __metadata: { "type": 'SP.Data.BCMSectionsListItem' }
            };
            ctrl.formData.forEach(function (item) {
                req.push($ApiService.updateListItem('BCM Sections', item.Id, data));
            });
            $q.all(req).then(function () {
                $EmailService.sendReviewerEmail(ctrl.formData).then(function () {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $Preload.hide();
                            $location.path('/publish-dashboard');
                        });
                    }, 0);
                });
            });
        }

        ctrl.reject = function () {
            $Preload.show();
            var req = [];
            var data = {
                FinalApproverComments: ctrl.FinalApproverComments,
                Stage: 'Approved',
                __metadata: { "type": 'SP.Data.BCMSectionsListItem' }
            };
            ctrl.formData.forEach(function (item) {
                req.push($ApiService.updateListItem('BCM Sections', item.Id, data));
            });
            $q.all(req).then(function () {
                $EmailService.sendFinalReviewerRejectEmail(ctrl.formData).then(function () {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $Preload.hide();
                            $location.path('/publish-dashboard');
                        });
                    }, 0);
                });
            });
        }

        function createSectionIdFilterValue(sections) {
            var ids = [];
            sections.forEach(i => {
                ids.push(i.Id);
            });
            return 'BCMSectionId eq ' + ids.join(' or BCMSectionId eq ')
        }

        function groupBy(xs, key) {
            return xs.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        }

    }
})();