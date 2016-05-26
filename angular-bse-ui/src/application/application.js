angular.module('bse.ui.application', [])
    .run(function ($state, $rootScope) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
            var historyBack;
            if (!options.forward) {
                historyBack = true;
            }
            $rootScope.$emit('onViewChangeStart', historyBack);
        });
    })
    .controller('BseApplicationController', ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
        $scope.$on('onViewChangeStart', function (event, historyBack) {
            if (historyBack) {
                $element.addClass("slide-back");
            }
            else {
                $element.removeClass("slide-back");
            }
        });
    }])
    .directive('bseApplicationContent', function () {
        return {
            controller: 'BseApplicationController',
            transclude: true,   // Grab the contents to be used as the heading
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/application/content.html';
            },
        };
    });