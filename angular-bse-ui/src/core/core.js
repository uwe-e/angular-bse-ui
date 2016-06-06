angular.module('bse.ui.core', [])
    .service('$bsecore', function () {
        var coreService = function () {
            //navigation directions
            this.directions = {
                none: 1,
                forward: 2,
                backward: 3
            };
        }
        return new coreService();
    });