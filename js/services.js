angular.module('SimpleRESTIonic.services', [])

    .service('APIInterceptor', function ($rootScope, $q) {
        var service = this;

        service.responseError = function (response) {
            if (response.status === 401) {
                $rootScope.$broadcast('unauthorized');
            }
            return $q.reject(response);
        };
    })

    .service('ItemsModel', function ($http, Backand) {
        var service = this,
            baseUrl = '/1/objects/',
            objectName = 'items/',
            baseActionUrl = baseUrl + 'action/',
            filesActionName = 'otherFiles';

        function getUrl() {
            return Backand.getApiUrl() + baseUrl + objectName;
        }

        function getUrlForId(id) {
            return getUrl() + id;
        }

        service.all = function () {
            return $http.get(getUrl());
        };

        service.fetch = function (id) {
            return $http.get(getUrlForId(id));
        };

        service.create2 = function (object) {
            var randomFileName = "bigFileImage"+Math.floor((Math.random() * 10 + 1) + 1 )+ Math.floor((Math.random() * 10 + 1) + 1) + object.bigPictureName;//file.name;
        return $http({
            method: 'POST',
            url : Backand.getApiUrl() + baseActionUrl +  objectName,
            params:{
                "name": filesActionName
            },
            headers: {
                'Content-Type': 'application/json'
            },
            // you need to provide the file name and the file data
            data: {
                "filename": randomFileName,
                "filedata": object.bigPictureBase.substr(object.bigPictureBase.indexOf(',') + 1, object.bigPictureBase.length), //need to remove the file prefix type
            }
        })
        };

        service.create = function (object) {
            return $http.post(getUrl(), object);
        };

        service.deleteOldFile = function(object, deleteFileName){
               return $http({
                    method: 'DELETE',
                    url : Backand.getApiUrl() + baseActionUrl +  objectName,
                    params:{
                        "name": filesActionName
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // you need to provide the file name 
                    data: {
                        "filename": deleteFileName
                    }
                });
        }

        service.update = function (id, object) {
            return $http.put(getUrlForId(id), object);
        };

        service.delete = function (id) {
            return $http.delete(getUrlForId(id));
        };
    })

    .service('LoginService', function (Backand) {
        var service = this;

        service.signin = function (email, password, appName) {
            //call Backand for sign in
            return Backand.signin(email, password);
        };

        service.anonymousLogin= function(){
            // don't have to do anything here,
            // because we set app token att app.js
        }

        service.signout = function () {
            return Backand.signout();
        };
    });
