(function () {
    angular.module('App')
        .component('combineSections', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/combine-sections/combine-sections.view.html?rnd' + Math.random(),
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
            $location.path('/combine-sections/' + ctrl.formData[0].BCMID);
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
            var req = [];
            var data = {
                Stage: 'Combined',
                __metadata: { "type": 'SP.Data.BCMSectionsListItem' }
            };
            ctrl.formData.forEach(function (iten) {
                req.push($ApiService.updateListItem('BCM Sections', iten.Id, data));
            });
            $q.all(req).then(function (res) {
                var filesReq = [];
                if (ctrl.$DraftBCMAttachment && ctrl.$DraftBCMAttachment.length) {
                    ctrl.$DraftBCMAttachment.forEach(function (file) {
                        filesReq.push($ApiService.uploadFile('BCM Sections Attachments', file.$file, {
                            BCMID: ctrl.formData[0].BCMID,
                            AttachmentType: 'Draft BCM',
                            __metadata: { "type": 'SP.Data.BCMSectionsAttachmentsItem' }
                        }));
                    });
                    $q.all(filesReq).then(function () {
                        if (isSubmit) {
                            $EmailService.sendReviewerEmail(ctrl.formData).then(function () {
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $Preload.hide();
                                        $location.path('/combine-dashboard');
                                    });
                                }, 0);
                            });
                        }
                        else {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $Preload.hide();
                                    $location.path('/combine-dashboard');
                                });
                            }, 0);
                        }
                    });
                }
                else {
                    if (isSubmit) {
                        $EmailService.sendReviewerEmail(ctrl.formData).then(function () {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $Preload.hide();
                                    $location.path('/combine-dashboard');
                                });
                            }, 0);
                        });
                    }
                    else {
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $Preload.hide();
                                $location.path('/combine-dashboard');
                            });
                        }, 0);
                    }
                }
            });
        }

        ctrl.removeDraftBCMAttachment = function () {
            if (ctrl.$DraftBCMAttachment[0].item && ctrl.$DraftBCMAttachment[0].item.Id) {
                $Preload.show();
                $ApiService.deleteListItem("BCM Sections Attachments", ctrl.$DraftBCMAttachment[0].item.Id).then(function (res) {
                    setTimeout(function () {
                        ctrl.$DraftBCMAttachment = [];
                        $Preload.hide();
                        $scope.$apply();
                    }, 0);

                });
            }
            else {
                ctrl.$DraftBCMAttachment.splice(0, 1);
                setTimeout(function () {
                    $scope.$apply();
                }, 0);
            }
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