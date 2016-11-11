var myApp = angular.module('myApp', ['ngTouch', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'ui.router', 'ct.ui.router.extras', 'bse.ui', 'ui.grid', 'ui.grid.autoResize', 'ui.grid.saveState'])
.run(function ($state, $rootScope, $location) {
    $rootScope.$state = $state;
    $rootScope.$location = $location;
}).config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'views/home.html',
        controller: "homeController",
    }).state('masterdetail', {
        url: '/masterdetail',
        templateUrl: 'views/masterdetail.html'
    }).state('masterdetail.worklist', {
        url: '/worklist',
        sticky: true,
        views: {
            'worklist': {
                templateUrl: 'views/masterdetail-worklist.html',
                controller: 'masterDetailWorklistController'
            }
        }
    });
}).factory('dataFactory', function ($http) {
    return {
        getGridData: function () {
            return $http({ method: 'get', url: "https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/500_complex.json" });
        }
    }
}).controller('homeController', function ($scope, $http, $log, $timeout, $state) {

}).controller('masterDetailWorklistController', function ($scope, $http, $log, $timeout, $state, $filter, dataFactory) {
    $scope.recordsCount;
    $scope.isLoading = false;

    $scope.grid = {
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        rowTemplate: '<div ng-click="grid.appScope.onRowSelected(row)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="col.colIndex()" ui-grid-cell></div>'
    };
    $scope.grid.columnDefs = [
          { name: 'id', width: 50 },
          { name: 'name', width: 200, pinnedLeft: true },
          //{ name: 'age', width: 100, pinnedRight: true },
          { name: 'address.street', width: 150 },
          { name: 'address.city', width: 150 },
          { name: 'address.state', width: 150 },
          { name: 'address.zip', width: 50 },
          { name: 'company', width: 150 },
          { name: 'email', width: 200 },
          { name: 'phone', width: 150 },
          //{ name: 'about', width: 300 },
    ];
    $scope.users = [];
    $scope.grid.data = [];
    loadGridData();

    function loadGridData() {
        $scope.isLoading = true;
        dataFactory.getGridData().then(function (response) {
            $scope.recordsCount = response.data.length;
            $scope.grid.data = response.data;
            return response.data;

        }).then(function (users) {
            $scope.users = users;
            //var t = $filter('address.state')($scope.users, "Alaska");
            $scope.grid.data = users;
        }).then(function () {
            $scope.isLoading = false;
        });
    }

    
    //$scope.groupBy = function (player) {
    //    var teamIsNew = indexedTeams.indexOf(player.team) == -1;
    //    if (teamIsNew) {
    //        indexedTeams.push(player.team);
    //    }
    //}

});

angular.element(document).ready(function () {
    angular.bootstrap(document, ['myApp']);
});
