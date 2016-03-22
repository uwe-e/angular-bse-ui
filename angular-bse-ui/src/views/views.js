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
    });