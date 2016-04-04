angular.module("bse.ui", ["bse.ui.tpls", "bse.ui.application","bse.ui.icontabs","bse.ui.tiles","bse.ui.views"]);
angular.module("bse.ui.tpls", ["template/icontabs/icontab.html","template/icontabs/icontabset.html","template/tiles/tilecontainer.html","template/views/footer.html","template/views/header.html","template/views/headernavigation.html","template/views/view.html"]);
angular.module('bse.ui.application', [])
    .controller('BseApplicationController', ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
        
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
angular.module("template/icontabs/icontab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/icontabs/icontab.html",
    "<div class=\"icon-tab-item\" ng-class=\"{active: active}\" ng-click=\"select()\">\n" +
    "    <div class=\"icon-tab-item-icon-pane\"></div>\n" +
    "    <div class=\"icon-tab-item-text\"></div>\n" +
    "    <div class=\"icon-tab-item-arrow\"></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("template/icontabs/icontabset.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/icontabs/icontabset.html",
    "<div class=\"icon-tab-bar btn-toolbar\" role=\"toolbar\" ng-transclude></div>\n" +
    "");
}]);

angular.module("template/tiles/tilecontainer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tiles/tilecontainer.html",
    "<div class=\"tile-container\">\n" +
    "    <div class=\"tile-container-header\" mch-tile-container-header-transclude=\"title\"><h2><span ui-tile-header-title>{{title}}</span></h2></div>\n" +
    "    <div class=\"row tile-container-group\" ng-transclude></div>\n" +
    "</div>");
}]);

angular.module("template/views/footer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/views/footer.html",
    "<footer class=\"view-footer navbar navbar-inverse\">\n" +
    "    <div class=\"container\" ng-transclude></div>\n" +
    "</footer>");
}]);

angular.module("template/views/header.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/views/header.html",
    "<header class=\"view-header navbar navbar-default\">\n" +
    "    <div class=\"container-fluid\">\n" +
    "        <div ng-transclude></div>\n" +
    "        <div class=\"collapse navbar-collapse\">\n" +
    "            <h1 mch-view-title-transclude=\"title\"><small><span ui-view-title>{{title}}</span></small></h1>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</header>");
}]);

angular.module("template/views/headernavigation.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/views/headernavigation.html",
    "<div class=\"view-header-navigation navbar-header\">\n" +
    "    <a class=\"navbar-brand\"><span class=\"glyphicon glyphicon-arrow-left\" aria-hidden=\"true\"></span></a>\n" +
    "</div>");
}]);

angular.module("template/views/view.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/views/view.html",
    "<div class=\"view-container-central-box\">\n" +
    "    <div class=\"view-container\" ng-transclude></div>\n" +
    "</div>");
}]);
