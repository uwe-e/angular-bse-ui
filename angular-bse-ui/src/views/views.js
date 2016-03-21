angular.module("bse.ui.views", [])
    .controller('BseViewController', ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

    }])
    .directive('BseViewContent', function () {
    return {
        //require: '^mchApplication',
        transclude: true,   // Grab the contents to be used as the content of a view
        replace: true,
        templateUrl: function (element, attrs) {
            return attrs.templateUrl || 'bse/template/views/content.html';
        },
        link: function (scope, element, attrs, applicationCtrl) {
            applicationCtrl.resizeContent(element);
        }
    };
});