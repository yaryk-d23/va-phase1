var app = angular.module('App', [
    "ngAnimate",
    "ngRoute",
    "ngSanitize",
    "ngTouch",
    "ui.bootstrap",
    'ui.select',
    'preloader',
]);
app.run(function ($rootScope, $location, $Preload) {
    $Preload.show();
    getParentParams();
    $rootScope.$on('$locationChangeSuccess', function (angularEvent, newUrl, oldUrl) {
        window.parent.location.hash = "#" + newUrl.split('#')[1];
    });
    function getParentParams() {
        $location.path(window.parent.location.hash.replace('#', ''));
    }
});
app.controller('AppCtrl', [function () {
    var vm = this;
}]);
app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');

    $routeProvider
        .when('/bcm-dashboard', {
            template: '<bcm-dashboard></bcm-dashboard>'
        })
        .when('/forms-list', {
            template: '<forms-list></forms-list>'
        })
        .when('/assign-form', {
            template: '<assign-form></assign-form>'
        })
        .otherwise('/bcm-dashboard');
});
app.directive('fixFocusOnTouch', function () {
    return {
        restrict: 'A',
        controller: function ($element) {
            /*
            Usually, event handlers binding are made in the link function.
            But we need this handler to be executed first, so we add it in the controller function instead.
             */
            var inputElement = $element[0].querySelector('input.ui-select-search');
            angular.element(inputElement).bind('touchend', function (event) {
                event.stopImmediatePropagation();
            });
        }
    }
});
app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
})
