(function () {
    angular.module('App')
        .component('finalApproveSection', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/final-approve-section/final-approve-section.view.html?rnd' + Math.random(),
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
        ctrl.$Attachments = [];
        ctrl.$DraftBCMAttachment = [];

        function loadData() {
            $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title&$expand=BCMTitle&$filter=BCMID eq \'' + $routeParams.id + '\'').then(function (res) {
                ctrl.formData = res;
                var req = {
                    allSections: $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title&$expand=BCMTitle'),
                    draftBCMAttachment: $ApiService.getListItems('BCM Sections Attachments', '$expand=File&$filter=BCMID eq \'' + $routeParams.id + '\' and AttachmentType eq \'Draft BCM\''),
                    attachments: $ApiService.getListItems('BCM Sections Attachments', '$expand=File&$filter=(' + createSectionIdFilterValue(res) + ') and AttachmentType eq \'Section\''),
                };
                $q.all(req).then(function (reqRes) {
                    ctrl.allSections = groupBy(reqRes.allSections, 'BCMID');
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
            $location.path('/final-approve-section/' + ctrl.formData[0].BCMID);
        }

        ctrl.approve = function () {
            $Preload.show();
            var req = [];
            var data = {
                Stage: 'Final Approved',
                __metadata: { "type": 'SP.Data.BCMSectionsListItem' }
            };
            ctrl.formData.forEach(function (iten) {
                req.push($ApiService.updateListItem('BCM Sections', iten.Id, data));
            });
            $q.all(req).then(function (res) {
                $EmailService.sendReviewerEmail(ctrl.formData).then(function () {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $Preload.hide();
                            $location.path('/final-approve-dashboard');
                        });
                    }, 0);
                });
            });
        }

        ctrl.reject = function () {
            $Preload.show();
            var req = [];
            var data = {
                Stage: 'Approved',
                __metadata: { "type": 'SP.Data.BCMSectionsListItem' }
            };
            ctrl.formData.forEach(function (iten) {
                req.push($ApiService.updateListItem('BCM Sections', iten.Id, data));
            });
            $q.all(req).then(function (res) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        $Preload.hide();
                        $location.path('/final-approve-dashboard');
                    });
                }, 0);
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