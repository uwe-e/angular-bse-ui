angular.module("bse.ui.filterbar", [])
.directive('bseFilterBar', ['$animate', '$q', '$parse', '$injector', function ($animate, $q, $parse, $injector) {
    var $animateCss = $injector.has('$animateCss') ? $injector.get('$animateCss') : null;
    return {
        transclude: true,
        replace: true,
        scope: {
            textgo: '@',
            texthide: '@',
            textshow: '@',
            collapse: '=',
            onExecute: '&onExecute'
        },
        templateUrl: function (element, attrs) {
            return attrs.templateUrl || 'template/filterbar/filterbar.html';
        },
        controller: ['$scope', '$element', function ($scope, $element) {

            var expandingExpr, expandedExpr, collapsingExpr, collapsedExpr;
            $scope.texthide = $scope.texthide || 'Hide Filter Bar';
            $scope.textshow = $scope.textshow || 'Show Filter Bar';

            var btnGo = angular.element($element[0].querySelector('button.btn-execute-filter'));
            if (btnGo) {
                btnGo.on('click', function ($event) {
                    $scope.onExecute($event);
                });
            }

            var btnCollapse = angular.element($element[0].querySelector('button.btn-collapse-filterbar'));
            if (btnCollapse) {
                btnCollapse.on('click', function ($event) {
                    $scope.collapse = !$scope.collapse;
                    if (collapsablePanel) {
                        manageExpansion($scope.collapse)
                    }
                });
            }

            var collapsablePanel = angular.element($element[0].querySelector('div [bse-filter-bar-collapse]'));
            if (collapsablePanel) {
                expandingExpr = $parse(collapsablePanel[0].querySelector('[expandingExpr]'));
                expandedExpr = $parse(collapsablePanel[0].querySelector('[expanded]'));
                collapsingExpr = $parse(collapsablePanel[0].querySelector('[collapsing]'));
                collapsedExpr = $parse(collapsablePanel[0].querySelector('[collapsed]'));

                manageExpansion($scope.collapse)
            }

            function manageExpansion(shouldCollapse) {
                if (shouldCollapse) {
                    collapse();
                } else {
                    expand();
                }
            }
            //It's an adaption of the collapse directive in UI Bootstrap
            //https://github.com/angular-ui/bootstrap/blob/master/src/collapse/collapse.js
            function expand() {
                if (collapsablePanel.hasClass('collapse') && collapsablePanel.hasClass('in')) {
                    return;
                }

                $q.resolve(expandingExpr($scope))
                  .then(function () {
                      btnCollapse[0].textContent = $scope.texthide;
                      collapsablePanel.removeClass('collapse')
                        .addClass('collapsing')
                        .attr('aria-expanded', true)
                        .attr('aria-hidden', false);

                      if ($animateCss) {
                          $animateCss(collapsablePanel, {
                              addClass: 'in',
                              easing: 'ease',
                              to: { height: collapsablePanel[0].scrollHeight + 'px' }
                          }).start()['finally'](expandDone);
                      } else {
                          $animate.addClass(collapsablePanel, 'in', {
                              to: { height: collapsablePanel[0].scrollHeight + 'px' }
                          }).then(expandDone());
                      }
                  });
            }

            function expandDone() {
                collapsablePanel[0].removeClass('collapsing')
                  .addClass('collapse')
                  .css({ height: 'auto' });
                expandedExpr($scope);
            }

            function collapse() {
                if (!collapsablePanel.hasClass('collapse') && !collapsablePanel.hasClass('in')) {
                    return collapseDone();
                }

                $q.resolve(collapsingExpr($scope))
                  .then(function () {
                      btnCollapse[0].textContent = $scope.textshow;
                      collapsablePanel
                        // IMPORTANT: The height must be set before adding "collapsing" class.
                        // Otherwise, the browser attempts to animate from height 0 (in
                        // collapsing class) to the given height here.
                        .css({ height: collapsablePanel[0].scrollHeight + 'px' })
                        // initially all panel collapse have the collapse class, this removal
                        // prevents the animation from jumping to collapsed state
                        .removeClass('collapse')
                        .addClass('collapsing')
                        .attr('aria-expanded', false)
                        .attr('aria-hidden', true);

                      if ($animateCss) {
                          $animateCss(collapsablePanel, {
                              removeClass: 'in',
                              to: { height: '0' }
                          }).start()['finally'](collapseDone);
                      } else {
                          $animate.removeClass(collapsablePanel, 'in', {
                              to: { height: '0' }
                          }).then(
                          collapseDone()
                          );
                      }
                  });
            }

            function collapseDone() {
                collapsablePanel.css({ height: '0' }) // Required so that collapse works when animation is disabled
                    .removeClass('collapsing')
                    .addClass('collapse');
                collapsedExpr($scope);
            }
        }]
    };
}]);