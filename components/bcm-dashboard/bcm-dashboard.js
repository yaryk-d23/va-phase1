(function () {
    angular.module('App')
        .component('bcmDashboard', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/app/components/bcm-dashboard/bcm-dashboard.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$ApiService', '$Preload', ctrl]
        });

    function ctrl($ApiService, $Preload) {
        $Preload.show();
        var ctrl = this;
        ctrl.items = [];
        $ApiService.getListItems('Business Cycle Memos', '$select=*,POC/Title&$expand=POC').then(function (res) {
            ctrl.items = res;
            $Preload.hide();
        });
    }
})();