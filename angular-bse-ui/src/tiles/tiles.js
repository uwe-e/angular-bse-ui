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