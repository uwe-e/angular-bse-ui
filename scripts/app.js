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
    }).state('masterdetail.address', {
        url: '/address/:userid',
        views: {
            'address': {
                templateUrl: 'views/masterdetail-address.html',
                controller: 'masterDetailAddressController'
            }
        }
    }).state('icontabbar', {
        url: '/icontabbar',
        templateUrl: 'views/icontabbar.html'
    }).state('icontabbar.worklist', {
        url: '/worklist',
        sticky: true,
        views: {
            'worklist': {
                templateUrl: 'views/icontabbar-worklist.html',
                controller: 'iconTabBarWorklistController'
            }
        }
    }).state('icontabbar.address', {
        url: '/address/:userid',
        views: {
            'address': {
                templateUrl: 'views/icontabbar-address.html',
                controller: 'iconTabBarAddressController'
            }
        }
    });
}).factory('dataFactory', function ($http) {
    return {
        getData: function () {
            return $http({ method: 'get', url: "https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/500_complex.json" });
        }
    }
})
    .filter('groupBy', ['$filter', function ($filter) {
        function getValue(element, propertyArray) {
            var value = element;
            angular.forEach(propertyArray, function (property) {
                value = value[property];
            });
            return value;
        }

        function parseString(input) {
            return input.split(".");
        }

        return function (collection, propertyString, target) {
            var output = [], keys = [];
            var properties = parseString(propertyString);

            $filter('filter')(collection, function (item) {
                var key = getValue(item, properties);
                if (keys.indexOf(key) === -1) {
                    keys.push(key);
                    output.push(item);
                }
            });
            return output;
        }
    }])
    .controller('homeController', function ($scope, $http, $log, $timeout, $state) {

    }).controller('masterDetailWorklistController', function ($scope, $http, $log, $timeout, $state, $filter, uiGridConstants, dataFactory) {
        $scope.search = {};
        $scope.recordsCount;
        $scope.isLoading = false;

        $scope.grid = {
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableFiltering: true,
            multiSelect: false,
            rowTemplate: '<div ng-click="grid.appScope.onRowSelected(row)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="col.colIndex()" ui-grid-cell></div>',
            columnDefs: [
                      { field: 'id' },
                      { field: 'name', name: 'name', width: 200, pinnedLeft: true },
                      { name: 'address.street', width: 150 },
                      { name: 'address.city', width: 150 },
                      { field: 'address.state', name: 'address.state', width: 150 },
                      { name: 'address.zip', width: 50 },
                      { name: 'company', width: 150 },
                      { name: 'email', width: 200 },
                      { name: 'phone', width: 150 },
            ],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
            }
        };

        $scope.users = [];
        $scope.grid.data = [];
        loadData();

        function loadData() {
            $scope.isLoading = true;
            dataFactory.getData().then(function (response) {
                $scope.recordsCount = response.data.length;
                return response.data;

            }).then(function (users) {
                $scope.users = users;
                $scope.grid.data = users;
            }).then(function () {
                $scope.isLoading = false;
            });
        }

        $scope.executeSearch = function (search) {
            console.log($scope.gridApi.grid.columns[2])
            //$scope.gridApi.grid.columns[4].filters[0] = {
            //    condition: uiGridConstants.filter.EXACT,
            //    term: search.AddressFilterId
            //}
            $scope.gridApi.grid.columns[4].filters[0].term = search.AddressFilterId;
            //$scope.gridApi.grid.columns[0].filters[0] = {
            //    //condition: uiGridConstants.filter.Exact,
            //    term: 3
            //}

            $scope.gridApi.grid.refresh();
        };

        $scope.onRowSelected = function (row) {
            $state.go('masterdetail.address', { userid: row.entity.id });
        }

    })
    .controller('masterDetailAddressController', function ($scope, $http, $state, $stateParams, $filter, dataFactory) {
        $scope.userId = parseInt($stateParams.userid, 0);

        loadData();

        $scope.saveProfile = function () {
            $scope.gotoWorklist();
        }

        $scope.gotoWorklist = function () {
            $state.goBack('masterdetail.worklist');
        }

        function loadData() {
            $scope.isLoading = true;
            dataFactory.getData().then(function (response) {
                $scope.users = angular.fromJson(response.data);
                return $filter('filter')($scope.users, { id: $scope.userId }, true)[0];
            }).then(function (user) {
                $scope.user = user;
            }).then(function () {
                $scope.isLoading = false;
            });
        }
    })
    .controller('iconTabBarWorklistController', function ($scope, $http, $state, $stateParams, $filter, uiGridConstants, dataFactory) {
        $scope.filter = {};
        $scope.grid = {
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableFiltering: true,
            multiSelect: false,
            rowTemplate: '<div ng-click="grid.appScope.onRowSelected(row)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="col.colIndex()" ui-grid-cell></div>',
            columnDefs: [
                      { field: 'id' },
                      { field: 'name', name: 'name', width: 200, pinnedLeft: true },
                      { name: 'gender', width: 100 },
                      { name: 'address.street', width: 150 },
                      { name: 'address.city', width: 150 },
                      { field: 'address.state', name: 'address.state', width: 150 },
                      { name: 'address.zip', width: 50 },
                      { name: 'company', width: 150 },
                      { name: 'email', width: 200 },
                      { name: 'phone', width: 150 },
            ],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
            }
        };

        $scope.users = [];
        $scope.grid.data = [];

        $scope.loadData = loadData;

        $scope.executeFilter = function (key){
            switch (key) {
                case 'male':
                case 'female':
                    $scope.gridApi.grid.columns[2].filters[0] = {
                        term: key,
                        condition: uiGridConstants.filter.EXACT
                    }
                    break;
                case 'alaska':
                case 'virginia':
                    $scope.gridApi.grid.columns[5].filters[0] = {
                        term: key,
                        condition: uiGridConstants.filter.EXACT
                    }
                    break;
                default:
                    $scope.gridApi.grid.clearAllFilters();
            }
        }

        $scope.onRowSelected = function (row) {
            $state.go('icontabbar.address', { userid: row.entity.id });
        }

        function loadData() {
            $scope.isLoading = true;
            if ($scope.gridApi) {
                $scope.gridApi.grid.clearAllFilters();
            }

            dataFactory.getData().then(function (response) {
                $scope.recordsCount = response.data.length;
                return response.data;
            }).then(function (users) {
                $scope.users = users;
                $scope.grid.data = users;
            }).then(function () {
                $scope.isLoading = false;
            });
        }
    }).controller('iconTabBarAddressController', function ($scope, $http, $state, $stateParams, $filter, dataFactory) {
        $scope.userId = parseInt($stateParams.userid, 0);

        loadData();

        $scope.saveProfile = function () {
            $scope.gotoWorklist();
        }

        $scope.gotoWorklist = function () {
            $state.goBack('icontabbar.worklist');
        }

        function loadData() {
            $scope.isLoading = true;
            dataFactory.getData().then(function (response) {
                $scope.users = angular.fromJson(response.data);
                return $filter('filter')($scope.users, { id: $scope.userId }, true)[0];
            }).then(function (user) {
                $scope.user = user;
            }).then(function () {
                $scope.isLoading = false;
            });
        }
    });

angular.element(document).ready(function () {
    angular.bootstrap(document, ['myApp']);
});
