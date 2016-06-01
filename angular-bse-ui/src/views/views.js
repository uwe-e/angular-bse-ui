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
        this.resizeGrid = function (grid) {
            var view = parents(grid, '.view-content');
            if (view) {
                var offsetHeight = 10;
                //if there is a filterbar on top of the content..
                var smartBar = view.querySelector('.filterbar');
                if (smartBar) {
                    //gets the height of this filterbar
                    offsetHeight = smartBar.offsetHeight;
                }
                //if the grid is located within a list-report panel..
                var parent = parents(grid, '.list-report');
                if (parent) {
                    angular.forEach(parent.children, function (child) {
                        if (child != grid[0]) {
                            //gets the height of other elements
                            offsetHeight += child.offsetHeight;
                        }
                    });
                }
                grid[0].style.height = view.clientHeight - offsetHeight + 'px';
            }
        };
        /*
        * Get the ancestors of an element in the current set of matched elements, filtered by a selector.
        * If there's no ancestor element, the function returns undefined.
        */
        function parents(element, selector) {
            if (element && element[0] !== document) {
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
    .directive('bseGridAutoResize', function ($timeout, $window) {
        return {
            require: '^bseViewContent',
            restrict: 'A',
            link: function (scope, element, attrs, applicationCtrl) {
                $timeout(function () {
                    applicationCtrl.resizeGrid(element);
                });
                //When the window resizes, the grid resizing will be executed again.
                angular.element($window).bind('resize', function () {
                    applicationCtrl.resizeGrid(element);
                });
            }
        };
    });