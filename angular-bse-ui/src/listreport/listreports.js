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