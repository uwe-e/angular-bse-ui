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