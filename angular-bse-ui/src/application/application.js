angular.module('bse.ui.application', ['bse.ui.core', 'ui.router'])
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
    .config(function ($provide) {
        $provide.decorator('$state', function ($delegate) {
            // let's locally use 'state' name
            var state = $delegate;

            // let's extend this object with new function 
            // 'baseGo', which in fact, will keep the reference
            // to the original 'go' function
            state.baseGo = state.go;

            //Convenience extension method for transitioning to a new state.
            //$state.goBack calls $state.go internally but automatically sets options to { forward: false}.
            //This is necessary for the initialization of the backward animation.
            state.goBack = function (to, params, options) {
                options = options || {};

                if (angular.isUndefined(options.direction)) {
                    options.direction = this.directions.backward;
                }

                // return processing to the 'baseGo' - original
                this.baseGo(to, params, options);
            };

            state.goSelf = function (to, params, options) {
                options = options || {};

                if (angular.isUndefined(options.direction)) {
                    options.direction = this.directions.none;
                }

                // return processing to the 'baseGo' - original
                this.baseGo(to, params, options);

            };

            // here comes our new 'go' decoration
            var go = function (to, params, options) {
                options = options || {};

                if (angular.isUndefined(options.direction)) {
                    options.direction = this.directions.forward;
                }

                // return processing to the 'baseGo' - original
                this.baseGo(to, params, options);
            };

            // assign new 'go', right now decorating the old 'go'
            state.go = go;

            return $delegate;
        });
    })
    .controller('BseApplicationController', ['$scope', '$element', '$attrs', '$bsecore', '$timeout', function ($scope, $element, $attrs, $bsecore, $timeout) {
        $scope.$on('onViewChangeStart', function (event, direction) {

            $element.removeClass("slide-back");
            $element.removeClass("slide-forward");

            if (direction === $bsecore.directions.forward) {
                $element.addClass("slide-forward");
            }
            else if (direction === $bsecore.directions.backward) {
                $element.addClass("slide-back");
            }

            //$timeout(function () {
            //    $element.removeClass("slide-back");
            //    $element.removeClass("slide-forward");
            //    $timeout(function () {
            //        if (direction === $bsecore.directions.forward) {
            //            $element.addClass("slide-forward");
            //        }
            //        else if (direction === $bsecore.directions.backward) {
            //            $element.addClass("slide-back");
            //        }
            //    });
            //});

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