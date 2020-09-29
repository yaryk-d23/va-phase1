(function () {
    angular.module('App')
        .component('approveDashboard', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/approve-dashboard/approve-dashboard.view.html?rnd' + Math.random(),
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
        $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title&$expand=BCMTitle&$filter=Stage eq \'Submitted\'').then(function (res) {
            ctrl.bcmSections = res;
            $Preload.hide();
        });

    }
})();