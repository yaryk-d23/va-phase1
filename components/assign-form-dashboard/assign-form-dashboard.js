(function () {
    angular.module('App')
        .component('assignFormDashboard', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/assign-form-dashboard/assign-form-dashboard.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$ApiService', '$Preload', '$q', ctrl]
        });

    function ctrl($ApiService, $Preload, $q) {
        $Preload.show();
        var ctrl = this;
        ctrl.bcmSections = [];
        $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title&$expand=BCMTitle&$filter=Stage eq \'Assigned\'').then(function (res) {
            ctrl.bcmSections = groupBy(res, 'BCMID');
            $Preload.hide();
        });
        // $ApiService.getCurrentUser().then(function (user) {
        //     $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title&$expand=BCMTitle&$filter=AssigneeId eq ' + user.Id).then(function (res) {
        //         ctrl.bcmSections = res;
        //         $Preload.hide();
        //     });
        // });

        function groupBy(xs, key) {
            return xs.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        }

    }
})();