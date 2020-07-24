// NOTE: Update all PRmedia references to be the name of your project.
// Adds the resource to umbraco.resources module:
angular.module('umbraco.resources').factory('colorLibraryResource',
    function ($q, $http, umbRequestHelper) {


        var moduleService = {};

        moduleService.getColorList = function () {
            return umbRequestHelper.resourcePromise(
                $http.get("backoffice/PRmedia/ColorLibraryApi/getColorList"),
                "Failed to retrieve library data");
        }

        moduleService.saveNewColor = function (value, name) {
            var dataObj = {
                HexCode: value,
                Name: name
            }
            return umbRequestHelper.resourcePromise(
                $http.post("backoffice/PRmedia/ColorLibraryApi/PostNewColor", dataObj),
                "Failed to retrieve library data");
        }

        return moduleService;
    }
);