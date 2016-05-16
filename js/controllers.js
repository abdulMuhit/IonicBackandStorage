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

    .controller('DashboardCtrl', function (ItemsModel, $rootScope) {
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
                        cancelCreate();
                        getAll();
                    })
                });
            }
        }

    function update(object) {
        console.log(object);

         if (!object.bigPictureUrlLast) {
            if(object.bigPictureName) {
            //    console.log('case1 no last imageLoaded');
            ItemsModel.create2(object)
                .then(function(result){
                    object.bigPictureUrl = result.data.url;
                    ItemsModel.update(object.id, object)
                        .then(function (result) {
                        cancelEditing();
                        getAll();
                });
            })        
            }
            else {
              //  console.log('case2 imageLoaded');
            ItemsModel.update(object.id, object)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                });
            }
        } else {

            if(!object.bigPictureName) {
            //console.log('case3 imageLast but not update');
            ItemsModel.update(object.id, object)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                });
            } else{
                var compare = object.bigPictureUrlLast.slice(48);    
                var deleteFileName = object.bigPictureUrl.slice(34);

                if(object.bigPictureName !== compare) {
                  //  console.log('case4 imageLoaded different');
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
                //console.log('case5 imageLoaded same');
            ItemsModel.update(object.id, object)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                });
            }
        }
    } 
}

        function deleteObject(object) {
            if(!object.bigPictureUrl || !object.bigPictureUrl) {
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
            vm.newObject = {name: '', description: '', avatarBase:'', bigPictureUrl:'', bigPictureBase:'', bigPictureName:'', bigPictureUrlLast:''};
        }

        function setEdited(object) {
            object.bigPictureUrlLast =  object.bigPictureUrl;
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

function uploadFile(){
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

function uploadFile2(){
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

        vm.uploadFile2 = uploadFile2;
        vm.uploadFile = uploadFile;

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
