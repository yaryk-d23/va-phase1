(function () {
    angular.module('App')
        .component('myAssignedFormsDashboard', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/my-assigned-forms-dashboard/my-assigned-forms-dashboard.view.html?rnd' + Math.random(),
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
        $ApiService.getCurrentUser().then(function (user) {
            $ApiService.getListItems('BCM Sections', '$select=*,BCMTitle/Title&$expand=BCMTitle&$filter=(Stage eq \'Assigned\' or Stage eq \'Approved\') and AssigneeId eq ' + user.Id).then(function (res) {
                ctrl.bcmSections = res;
                $Preload.hide();
            });
        });

    }
})();