(function () {
    angular.module('App')
        .controller('sectionModalCtrl', ctrl);

    function ctrl($uibModalInstance, $ApiService, item) {
        var ctrl = this;
        ctrl.allUsers = [];
        ctrl.getUsers = function ($select) {
            if (!$select.search || $select.search.length < 1) return;
            $ApiService.getUser($select.search).then(function (res) {
                ctrl.allUsers = res;
            });
        };

        ctrl.item = angular.copy(item) || {};
        ctrl.ok = function () {
            if (ctrl.form.$invalid) {
                angular.forEach(ctrl.form.$error, function (field) {
                    angular.forEach(field, function (errorField) {
                        errorField.$setTouched();
                    });
                });
                return;
            }
            $uibModalInstance.close(ctrl.item);
        };
        ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
})();