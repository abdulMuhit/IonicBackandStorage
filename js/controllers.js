angular.module('SimpleRESTIonic.controllers', [])

    .directive('customOnChange', function() {
        return {
        restrict: 'A',
        link: function (scope, element, attrs) {
        var onChangeFunc = scope.$eval(attrs.customOnChange);
        element.bind('change', onChangeFunc);
            }
        };
    })

    .controller('LoginCtrl', function (Backand, $state, $rootScope, LoginService) {
        var login = this;

        function signin() {
            LoginService.signin(login.email, login.password)
                .then(function () {
                    onLogin();
                }, function (error) {
                    console.log(error)
                })
        }

        function anonymousLogin(){
            LoginService.anonymousLogin();
            onLogin();
        }

        function onLogin(){
            $rootScope.$broadcast('authorized');
            $state.go('tab.dashboard');
        }

        function signout() {
            LoginService.signout()
                .then(function () {
                    //$state.go('tab.login');
                    $rootScope.$broadcast('logout');
                    $state.go($state.current, {}, {reload: true});
                })

        }

        login.signin = signin;
        login.signout = signout;
        login.anonymousLogin = anonymousLogin;
    })

        .controller('DashboardCtrl', function (ItemsModel, $rootScope, $scope) {
        var vm = this;

        function goToBackand() {
            window.location = 'http://docs.backand.com';
        }

        function getAll() {
            ItemsModel.all()
                .then(function (result) {
                    vm.data = result.data.data;
                });
        }

        function clearData(){
            vm.data = null;
        }

        var baseUrl = '/1/objects/',
            objectName = 'items/';
            var baseActionUrl = baseUrl + 'action/'        
            var filesActionName = 'otherFiles';

        function create(object) {     
        
            if(object.bigPictureName == "") {
                ItemsModel.create(object)
                .then(function (result) {
                    cancelCreate();
                    getAll();
                });  

            } else {
                ItemsModel.create2(object)
                .then(function (result) {
             object.bigPictureUrl = result.data.url;
             ItemsModel.create(object)
                    .then(function(result) {
                        console.log('create success')
                        cancelCreate();
                        getAll();
                    })
                });
            }
        }

    function update(object) {
        console.log($scope.bigPictureUrlLast);
        

        if($scope.bigPictureUrlLast == null){
                    ItemsModel.create2(object)
                     .then(function(result){
                        object.bigPictureUrl = result.data.url;
                    ItemsModel.update(object.id, object)
                        .then(function (result) {
                    cancelEditing();
                    getAll();
                });
                     })
        } else if(object.bigPictureName !== $scope.bigPictureUrlLast.slice(34)) {
        var deleteFileName = $scope.bigPictureUrlLast.slice(34);
        ItemsModel.deleteOldFile(object, deleteFileName).then(function(){
                     console.log('last file deleted');
                     ItemsModel.create2(object)
                     .then(function(result){
                        object.bigPictureUrl = result.data.url;

                    ItemsModel.update(object.id, object)
                        .then(function (result) {
                    cancelEditing();
                    getAll();
                });
                     })
                })
        } else {
            ItemsModel.update(object.id, object)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                });
        }
    }

        function deleteObject(object) {
            if(object.bigPictureUrl == "" || object.bigPictureUrl == null) {
                ItemsModel.delete(object.id)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                });   
            } else {
                var deleteFileName = object.bigPictureUrl.slice(34);
                ItemsModel.deleteOldFile(object, deleteFileName)

                  .then(function(){
                    console.log('file deleted');
                    ItemsModel.delete(object.id)
                        .then(function (result) {
                    cancelEditing();
                    getAll();
                });
                })
            }
        }

        function initCreateForm() {
            vm.newObject = {name: '', description: '', avatarBase:'', bigPictureUrl:'', bigPictureBase:'', bigPictureName:''};
        }

        function setEdited(object) {
            $scope.avatarBaseLast =  object.avatarBase;
            $scope.bigPictureUrlLast =  object.bigPictureUrl;
            vm.edited = angular.copy(object);
            vm.isEditing = true;
        }

        function isCurrent(id) {
            return vm.edited !== null && vm.edited.id === id;
        }

        function cancelEditing() {
            vm.edited = null;
            vm.isEditing = false;
        }

        function cancelCreate() {
            initCreateForm();
            vm.isCreating = false;
        }


    $scope.uploadFile = function() {
    var filesSelected = document.getElementById("myFile").files;
    if (filesSelected.length > 0) {
        var fileToLoad = filesSelected[0];
        if (fileToLoad.type.match("image.*") && fileToLoad.size < 100000 )
        {
            var fileReader = new FileReader();
            fileReader.onload = function(fileLoadedEvent) 
            {
                var imageLoaded = document.getElementById("showPic");
                imageLoaded.src = fileLoadedEvent.target.result;
            if(vm.isCreating) {
                vm.newObject.avatarBase = fileLoadedEvent.currentTarget.result;
            } else {
                vm.edited.avatarBase = fileLoadedEvent.currentTarget.result;
            } 

            };
            fileReader.readAsDataURL(fileToLoad);
        } else {
            alert('file is not an image or exceed 1 Mb');
        }
    }
}

$scope.uploadFile2 = function() {
    var filesSelected = document.getElementById("myFile2").files;
    if (filesSelected.length > 0) {
        var fileToLoad = filesSelected[0];
        console.log(fileToLoad.name);
        if (fileToLoad.type.match("image.*"))
        {
            var fileReader = new FileReader();
            fileReader.onload = function(fileLoadedEvent) 
            {
                var imageLoaded = document.getElementById("showPic2");
                imageLoaded.src = fileLoadedEvent.target.result;
                
            if(vm.isCreating) {
                vm.newObject.bigPictureName = fileToLoad.name;
                vm.newObject.bigPictureBase = fileLoadedEvent.currentTarget.result;
            } else {
                vm.edited.bigPictureName = fileToLoad.name;
                vm.edited.bigPictureBase = fileLoadedEvent.currentTarget.result;
            } 

            };
            fileReader.readAsDataURL(fileToLoad);
        } else {
            alert('file is not an image');
        }
    }
}
        
        vm.objects = [];
        vm.edited = null;
        vm.isEditing = false;
        vm.isCreating = false;
        vm.getAll = getAll;
        vm.create = create;
        vm.update = update;
        vm.delete = deleteObject;
        vm.setEdited = setEdited;
        vm.isCurrent = isCurrent;
        vm.cancelEditing = cancelEditing;
        vm.cancelCreate = cancelCreate;
        vm.goToBackand = goToBackand;
        vm.isAuthorized = false;

        $rootScope.$on('authorized', function () {
            vm.isAuthorized = true;
            getAll();
        });

        $rootScope.$on('logout', function () {
            clearData();
        });

        if(!vm.isAuthorized){
            $rootScope.$broadcast('logout');
        }

        initCreateForm();
        getAll();

    });