angular.module("bse.ui", ["bse.ui.core","bse.ui.application","bse.ui.charts","bse.ui.filterbar","bse.ui.icontabs","bse.ui.listreport","bse.ui.shell","bse.ui.tiles","bse.ui.views"]);
angular.module('bse.ui.core', [])
    .service('$bsecore', function () {
        var coreService = function () {
            //navigation directions
            this.directions = {
                none: 1,
                forward: 2,
                backward: 3
            };
        }
        return new coreService();
    });
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
angular.module('bse.ui.charts', [])
    .directive('bseChartToolbar', function () {
        return {
            transclude: true,   // Grab the contents to be used as the application's viewport.
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/charts/charttoolbar.html';
            }
        };
    })
    .directive('bseChartArea', function () {
        return {
            transclude: true,   // Grab the contents to be used as the application's viewport.
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/charts/chartarea.html';
            },
            controller: function () {
                this.setHeading = function (element) {
                    this.heading = element;
                };
            },
            compile: function (element, attrs) {
                var canvas = element.find('canvas');
                angular.forEach(attrs.$attr, function (key, value) {
                    if (value.substr(0, 5) == 'chart') {
                        angular.element(canvas[0]).attr(key, attrs[value]);
                    }
                });
            }
        };
    })
    .directive('bseChartAreaHeading', function () {
        return {
            transclude: true,   // Grab the contents to be used as the heading
            template: '',       // In effect remove this element!
            replace: true,
            require: '^bseChartArea',
            link: function (scope, element, attrs, controller, transclude) {
                // Pass the heading to the chartarea controller
                // so that it can be transcluded into the right place in the template
                // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
                controller.setHeading(transclude(scope, angular.noop));
            }
        };
    })
    .directive('bseChartAreaTransclude', function () {
        return {
            require: '^bseChartArea',
            link: function (scope, element, attrs, controller) {
                scope.$watch(function () { return controller[attrs.bseChartAreaTransclude]; }, function (heading) {
                    if (heading) {
                        var elem = angular.element(element[0].querySelector('[bse-chart-area-header]'));
                        elem.html('');
                        elem.append(heading);
                    }
                });
            }
        }
    });
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
angular.module('bse.ui.icontabs', [])
    .controller('BseIconTabsetController', ['$scope', function ($scope) {
        var ctrl = this,
            oldIndex;
        ctrl.tabs = [];

        ctrl.select = function (index) {
            if (!destroyed) {
                var previousIndex = findTabIndex(oldIndex);
                var previousSelected = ctrl.tabs[previousIndex];
                if (previousSelected) {
                    previousSelected.tab.onDeselect();
                    previousSelected.tab.active = false;
                }

                var selected = ctrl.tabs[index];
                if (selected) {
                    selected.tab.onSelect();
                    selected.tab.active = true;
                    ctrl.active = selected.index;
                    oldIndex = selected.index;
                } else if (!selected && angular.isNumber(oldIndex)) {
                    ctrl.active = null;
                    oldIndex = null;
                }
            }
        };

        ctrl.addTab = function addTab(tab) {
            ctrl.tabs.push({
                tab: tab,
                index: tab.index
            });
        };

        ctrl.removeTab = function removeTab(tab) {
            var index = findTabIndex(tab.index);

            if (tab.index === ctrl.active) {
                var newActiveTabIndex = index === ctrl.tabs.length - 1 ?
                  index - 1 : index + 1 % ctrl.tabs.length;
                ctrl.select(newActiveTabIndex);
            }
            ctrl.tabs.splice(index, 1);
        };

        $scope.$watch('tabset.active', function (val) {
            if (angular.isNumber(val) && val !== oldIndex) {
                ctrl.select(findTabIndex(val));
            }
        });

        var destroyed;
        $scope.$on('$destroy', function () {
            destroyed = true;
        });

        function findTabIndex(index) {
            for (var i = 0; i < ctrl.tabs.length; i++) {
                if (ctrl.tabs[i].index === index) {
                    return i;
                }
            }
        }
    }])
    .directive('bseIconTabset', function () {
        return {
            transclude: true,
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/icontabs/icontabset.html';
            },
            controller: 'BseIconTabsetController',
            restrict: 'EA'
        };
    })
    .directive('bseIconTab', ['$document', function ($document) {
        return {
            require: '^BseIconTabset',
            transclude: true,
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/icontabs/icontab.html';
            },
            restrict: 'EA',
            controller: function () {
            },
            scope: {
                text: '@',
                count: '@',
                icon: '@',
                orientation: '@',
                color: '@',
                onSelect: '&select',    //This callback is called in contentHeadingTransclude
                //once it inserts the tab's content into the dom
                onDeselect: '&deselect'
            },
            link: function (scope, element, attrs, tabsetCtrl, transclude) {
                var tabElement = angular.element(element[0]);
                var paneElement = angular.element(element[0].querySelector('.icon-tab-item-icon-pane'));
                var textElement = angular.element(element[0].querySelector('.icon-tab-item-text'));
                var arrowElement = angular.element(element[0].querySelector('.icon-tab-item-arrow'));

                var hasIcon;

                tabElement.addClass('tab-item-orientation-vertical');
                var color = attrs.color;
                if (!angular.isDefined(color)) {
                    color = 'tab-primary';
                }

                var iconElement = createElement(attrs.icon, 'div');
                if (iconElement) {
                    hasIcon = true;
                    iconElement.addClass('icon-container' + ' ' + color + ' ' + 'glyphicon' + ' ' + attrs.icon);
                    paneElement.append(iconElement);
                }

                var countElement = createTextNode(attrs.count, 'span');
                if (countElement) {
                    countElement.addClass('icon-tab-item-count');
                    paneElement.append(countElement);

                    scope.$watch('count', function (count) {
                        countElement[0].textContent = count;
                    });
                }

                var hasText = angular.isDefined(attrs.text);
                if (hasText) {
                    var textNode = $document[0].createTextNode(attrs.text);
                    textElement.append(textNode);
                }
                else {
                    textElement.remove();
                }

                arrowElement.addClass(color);

                if (hasText && !hasIcon) {
                    tabElement.addClass('icon-tab-text-only');
                }

                if (angular.isUndefined(attrs.index)) {
                    if (tabsetCtrl.tabs && tabsetCtrl.tabs.length) {
                        scope.index = Math.max.apply(null, tabsetCtrl.tabs.map(function (t) { return t.index; })) + 1;
                    } else {
                        scope.index = 0;
                    }
                }

                scope.select = function () {
                    //if (!scope.disabled) {
                    var index;
                    for (var i = 0; i < tabsetCtrl.tabs.length; i++) {
                        if (tabsetCtrl.tabs[i].tab === scope) {
                            index = i;
                            break;
                        }
                    }
                    tabsetCtrl.select(index);
                    //}
                };

                tabsetCtrl.addTab(scope);
                scope.$on('$destroy', function () {
                    tabsetCtrl.removeTab(scope);
                });

                function createElement(value, tag) {
                    var element;
                    if (angular.isDefined(value)) {
                        element = angular.element($document[0].createElement(tag));
                    }
                    return element;
                }
                function createTextNode(value, tag) {
                    var element = createElement(value, tag);
                    if (element) {
                        var node = $document[0].createTextNode(value);
                        if (node) {
                            element.append(node);
                        }
                    }
                    return element;
                };
            }
        };
    }]);
angular.module('bse.ui.listreport', [])
    .directive('bseListReport', function () {
        return {
            transclude: true,   // Grab the contents to be used as the application's viewport.
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/listreport/listreport.html';
            }
        };
    })
    .directive('bseListReportToolbar', function () {
        return {
            transclude: true,   // Grab the contents to be used as the header of a view
            replace: true,
            require: ['^bseListReport', 'bseListReportToolbar'], //requires the parent 'bseView' directive and the local 'bseViewHeader' directive
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/listreport/toolbar.html';
            },
            restrict: 'EA',
            scope: {
                title: '@'
            },
            controller: function () {
                this.setTitle = function (element) {
                    this.title = element;
                };
                //},
                //link: function (scope, element, attrs, controllers) {
                //    var viewCtrl = controllers[0];
                //    if (viewCtrl) {
                //        viewCtrl.resizeContent(element);
                //    }
            }
        };
    });
angular.module('bse.ui.tiles', [])
    .directive('bseTileContainer', function () {
        return {
            transclude: true,   // Grab the contents to be used as the header of a view
            replace: true,
            templateUrl: 'template/tiles/tilecontainer.html',
            restrict: 'EA',
            scope: {
                title: '@'
            },
            controller: function () {
                this.setTitle = function (element) {
                    this.title = element;
                };
            }
        };
    }).directive('bseTileContainerHeaderTransclude', function () {
        return {
            require: '^bseTileContainer',
            link: function (scope, element, attrs, controller) {
                scope.$watch(function () { return controller[attrs.mchTileContainerHeaderTransclude]; }, function (title) {
                    if (title) {
                        var elem = angular.element(element[0].querySelector('[ui-tile-header-title]'));
                        elem.html('');
                        elem.append(title);
                    }
                });
            }
        };
    });
angular.module("bse.ui.views", [])
    .run(function ($state, $rootScope) {

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var slideBack;
            if (fromState.slideBack) {
                slideBack = true;
            }
            $rootScope.$emit('onHistoryDirectionChanged', slideBack);
        });
    })
    .controller('BseViewController', ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
        $scope.$on('onHistoryDirectionChanged', function (event, slideBack) {
            if (slideBack) {
                $element.addClass("slide-back");
            }
            else {
                $element.removeClass("slide-back");
            }
        });
        /*
        * resizes the height of the http://ui-grid.info datagrid.
        * If the grid is "auto sizable" performed through the "ui-grid-auto-resize" attribute within the grid's div element,
        * than it's resizable to the available height within the mch-view-content element through using 
        * the "mch-grid-auto-resize" attribute.
        *
        * <div ui-grid="grid" class="grid" ui-grid-save-state ui-grid-auto-resize ui-grid-selection mch-grid-auto-resize></div>
        *
        */
        this.resizeElement = function (element) {
            var view = parents(element, '.view-content');
            if (view) {
                var offsetHeight = 10;
                //if there is a filter- or icontabbar on top of the content..
                var toolBar = view.querySelector('.filterbar') || view.querySelector('.icon-tabbar') || view.querySelector('.view-content-toolbar');
                if (toolBar) {
                    //gets the height of this filter- or icontabbar
                    offsetHeight += toolBar.offsetHeight;
                }
                //if the grid is located within a list-report panel..
                var parent = parents(element, '.list-report');
                if (parent) {
                    angular.forEach(parent.children, function (child) {
                        if (child != element[0]) {
                            //gets the height of other elements
                            offsetHeight += child.offsetHeight;
                        }
                    });
                }
                element[0].style.height = view.clientHeight - offsetHeight + 'px';
            }
        };
        /*
        * Get the ancestors of an element in the current set of matched elements, filtered by a selector.
        * If there's no ancestor element, the function returns undefined.
        */
        function parents(element, selector) {
            if (element && element[0] && element[0] !== document) {
                var el = element[0].querySelector(selector);
                if (el) {
                    return el;
                }
                return parents(element.parent(), selector);
            }
            return;
        };
        /*
         * the <bse-view-header/> resp. the <bse-view-footer/> are optional elements. For determination the top and/or bottom position
         * of the <bse-view-conent/> the calculation is performed each time when an element attaches to the view.
         */
        this.resizeContent = function (element) {
            var view = element.parent();
            if (view) {
                var topPosition = 0, bottomPosition = 0;
                var header = view[0].querySelector('.view-header');
                if (header) {
                    topPosition = header.offsetHeight + 'px';
                }
                var footer = view[0].querySelector('.view-footer');
                if (footer) {
                    bottomPosition = footer.offsetHeight + 'px';
                }
                var content = view[0].querySelector('.view-content');
                if (content) {
                    content.style.top = topPosition;
                    content.style.bottom = bottomPosition;
                }
            }
        };
    }])
    .directive('bseView', function () {
        return {
            controller: 'BseViewController',
            transclude: true,   // Grab the contents to be used as the application's viewport.
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/views/view.html';
            }
        };
    })
    .directive('bseViewContent', function () {
        return {
            controller: 'BseViewController',
            transclude: true,   // Grab the contents to be used as the content of a view
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/views/content.html';
            },
            link: function (scope, element, attrs, applicationCtrl) {
                applicationCtrl.resizeContent(element);
            }
        };
    })
    .directive('bseViewHeader', function () {
        return {
            transclude: true,   // Grab the contents to be used as the header of a view
            replace: true,
            require: ['^bseView', 'bseViewHeader'], //requires the parent 'bseView' directive and the local 'bseViewHeader' directive
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/views/header.html';
            },
            restrict: 'EA',
            scope: {
                title: '@'
            },
            controller: function () {
                this.setTitle = function (element) {
                    this.title = element;
                };
            },
            link: function (scope, element, attrs, controllers) {
                var viewCtrl = controllers[0];
                if (viewCtrl) {
                    viewCtrl.resizeContent(element);
                }
            }
        };
    })
    .directive('bseViewFooter', function () {
        return {
            require: '^bseView',
            transclude: true,   // Grab the contents to be used as the footer of a view
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/views/footer.html';
            },
            link: function (scope, element, attrs, applicationCtrl) {
                applicationCtrl.resizeContent(element);
            }
        };
    })
    .directive('bseViewHeaderNavigation', function () {
        return {
            transclude: true,
            restrict: 'EA',
            replace: true,
            require: '^bseViewHeader',
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/views/headernavigation.html';
            },
            link: function (scope, element, attrs, headerCtrl, transclude) {
                headerCtrl.setTitle(transclude(scope, angular.noop));
            }
        };
    })
    .directive('bseAutoResize', function ($timeout, $window) {
        return {
            require: '^bseViewContent',
            restrict: 'A',
            link: function (scope, element, attrs, applicationCtrl) {
                $timeout(function () {
                    applicationCtrl.resizeElement(element);
                });
                //When the window resizes, the grid resizing will be executed again.
                angular.element($window).bind('resize', function () {
                    applicationCtrl.resizeElement(element);
                });
            }
        };
    })
    .directive('bseOverflowPanel', function ($document) {
        return {
            transclude: true,
            replace: true,
            scope: {
                isLoading: '=?',
                useWindowSize: '=?'
            },
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/views/overflowpanel.html';
            },
            link: function (scope, element, attrs) {

                if (scope.$eval(attrs.useWindowSize)) {
                    $document.find('body').append(element);
                }

                scope.$watch('isLoading', function (value) {
                    element.css('display', value ? 'block' : 'none');
                });

                scope.$on('$destroy', function () {
                    if ($document[0].querySelector('body > div.overflowpanel')) {
                        element.remove();
                    }
                });
            }
        }
    })
    .directive('bseMessagePanel', ['$document', function ($document) {
        return {
            transclude: true,
            replace: true,
            scope: {
                text: '@',
                icon: '@',
                description: '@',
                isOpen: '=?'
            },
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'template/views/messagepanel.html';
            },
            link: function (scope, element, attrs) {
                var panelElement = angular.element(element[0].querySelector('.panel-body'));

                var iconElement = createElement(attrs.icon, 'span');
                if (iconElement) {
                    iconElement.addClass('messagepannel-icon' + ' ' + attrs.icon);
                    panelElement.append(iconElement);
                }
                var textElement = createTextNode(attrs.text || 'No matching items found.', 'span');
                if (textElement) {
                    textElement.addClass('messagepannel-maintext');
                    panelElement.append(textElement);
                }

                var descriptionElement = createTextNode(attrs.description, 'span');
                if (descriptionElement) {
                    descriptionElement.addClass('messagepannel-description');
                    panelElement.append(descriptionElement);
                }

                scope.$watch('isOpen', function (value) {
                    element.css('display', value ? 'block' : 'none');
                });

                function createTextNode(value, tag) {
                    var element = createElement(value, tag);
                    if (element) {
                        var node = $document[0].createTextNode(value);
                        if (node) {
                            element.append(node);
                        }
                    }
                    return element;
                };

                function createElement(value, tag) {
                    var element;
                    if (angular.isDefined(value)) {
                        element = angular.element($document[0].createElement(tag));
                    }
                    return element;
                }
            }
        };
    }]);