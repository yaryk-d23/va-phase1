(function () {
    angular.module('App')
        .controller('internalControlModalCtrl', ctrl);

    function ctrl($uibModalInstance, $ApiService, item) {
        var ctrl = this;
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