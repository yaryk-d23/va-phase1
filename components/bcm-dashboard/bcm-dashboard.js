(function () {
    angular.module('App')
        .component('bcmDashboard', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/bcm-dashboard/bcm-dashboard.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$ApiService', '$Preload', '$q', ctrl]
        });

    function ctrl($ApiService, $Preload, $q) {
        $Preload.show();
        var ctrl = this;
        ctrl.items = [];
        ctrl.sections = {};
        ctrl.attachments = [];

        function loadData() {
            var req = {
                bcmItems: $ApiService.getListItems('Business Process Areas', '$select=*,POC/Title&$expand=POC'),
                sections: $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title&$expand=BCMTitle&$sortby=Modified asc'),
                attachments: $ApiService.getListItems('BCM Sections Attachments', '$expand=File&$filter=AttachmentType eq \'Draft BCM\'')
            };
            $q.all(req).then(function (res) {
                ctrl.items = res.bcmItems;
                ctrl.sections = groupBy(res.sections, 'BCMTitleId');
                res.attachments.forEach(function (file) {
                    ctrl.attachments.push({
                        $file: {
                            name: file.File.Name
                        },
                        url: file.ServerRedirectedEmbedUri || file.File.ServerRelativeUrl,
                        BCMID: file.BCMID
                    });
                });
                ctrl.attachments = groupBy(ctrl.attachments, 'BCMID');
                $Preload.hide();
            });
        }
        loadData();

        ctrl.getStatus = function (sections) {
            if (sections && sections.length) {
                var status = 'Completed';
                sections.forEach(function (item) {
                    if (item.Status === 'In Progres') {
                        status = 'In Progres';
                    }
                });
                return status;
            }
            else {
                return '-';
            }
        }

        function groupBy(xs, key) {
            return xs.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        }
    }
})();