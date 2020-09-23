(function () {
    angular.module('App')
        .component('formsList', {
            templateUrl: window["SITE_LOCATION_URL"] + '/SiteAssets/bcm-updates/components/forms-list/forms-list.view.html?rnd' + Math.random(),
            bindings: {
                //user: '<'
            },
            controllerAs: 'ctrl',
            controller: ['$ApiService', ctrl]
        });

    function ctrl() {
        var ctrl = this;
        ctrl.links = [{
            title: 'Assign BCM Sections',
            link: '#/assign-form'
        }, {
            title: 'Update/Submit BCM Sections',
            link: ''
        }, {
            title: 'Approve BCM Sections',
            link: ''
        }, {
            title: 'Combine BCM Sections',
            link: ''
        }, {
            title: 'Publish Updated BCM',
            link: ''
        },];
    }
})();