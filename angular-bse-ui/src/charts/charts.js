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