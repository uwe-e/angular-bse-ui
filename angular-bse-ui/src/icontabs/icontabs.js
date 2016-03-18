angular.module("bse.ui.icontabs", [])
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
    .directive('BseIconTabset', function () {
        return {
            transclude: true,
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'bse/template/icontabs/icontabset.html';
            },
            controller: 'BseIconTabsetController',
            restrict: 'EA'
        };
    })
    .directive('BseIconTab', ['$document', function ($document) {
        return {
            require: '^BseIconTabset',
            transclude: true,
            replace: true,
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || 'bse/template/icontabs/icontab.html';
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