angular.module('bse.ui.application', ['bse.ui.core'])
    .run(function ($state, $rootScope, $bsecore) {
        $state.directions = $bsecore.directions;
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
            var direction = options.direction;
            if (!direction) {
                direction = event.currentScope.$state.directions.backward;
            }
            $rootScope.$emit('onViewChangeStart', direction);
        });
    })
    .controller('BseApplicationController', ['$scope', '$element', '$attrs', '$bsecore', function ($scope, $element, $attrs, $bsecore) {
        $scope.$on('onViewChangeStart', function (event, direction) {

            $element.removeClass("slide-back");
            $element.removeClass("slide-forward");

            if (direction === $bsecore.directions.forward) {
                $element.addClass("slide-forward");
            }
            else if (direction === $bsecore.directions.backward) {
                $element.addClass("slide-back");
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