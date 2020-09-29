(function () {
    angular.module('App')
        .component('formsList', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/forms-list/forms-list.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$ApiService', '$Preload', ctrl]
        });

    function ctrl($ApiService, $Preload) {
        $Preload.hide();
        var ctrl = this;
        ctrl.links = [{
            title: 'Assign BCM Sections',
            link: '#/assign-form-dashboard'
        }, {
            title: 'Update/Submit BCM Sections',
            link: '#/my-assigned-forms-dashboard'
        }, {
            title: 'Approve BCM Sections',
            link: '#/approve-dashboard'
        }, {
            title: 'Combine BCM Sections',
            link: '#/combine-dashboard'
        }, {
            title: 'Publish Updated BCM',
            link: '#/publish-dashboard'
        },];
    }
})();