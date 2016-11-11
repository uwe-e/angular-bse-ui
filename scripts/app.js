var myApp = angular.module('myApp', ['ngTouch', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'ui.router', 'ct.ui.router.extras', 'bse.ui', 'ui.grid', 'ui.grid.autoResize', 'ui.grid.saveState'])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'views/home.html',
        controller: "homeController",
    });
})
.controller('homeController', ['$scope', '$http', '$log', '$timeout', '$state', function ($scope, $http, $log, $timeout, $state) {

}])

angular.element(document).ready(function () {
    angular.bootstrap(document, ['myApp']);
});
