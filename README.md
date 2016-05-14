# IonicBackandStorage
Ionic starter for backand project with upload image use base64 or Backand Storage

Hello, this is my first try to contribute in backand and ionic, so if there's any lack, please pardon me, 
and if theres another ways that more simple than this, 
pls also let me know, n thanks before.

Create mobile application with ionic and backand.

1 - create an acount in backand.com and create new app

2 - Use following model in the object tab :

[
  {
    "name": "items",
    "fields": {
      "name": {
        "type": "string"
      },
      "description": {
        "type": "text"
      },
      "avatarBase": {
        "type": "text"
      },
      "bigPictureUrl": {
        "type": "string"
      },
      "user": {
        "object": "users"
      }
    }
  },
  {
    "name": "users",
    "fields": {
      "email": {
        "type": "string"
      },
      "firstName": {
        "type": "string"
      },
      "lastName": {
        "type": "string"
      },
      "items": {
        "collection": "items",
        "via": "user"
      }
    }
  }
]

3 - create server side code for uploading bigger image, 

  a. in the object tab, click items tab, then click again actions tab.
  b. create new on demand execute, name it otherFiles, event trigger = on demand, pick type = server side code.
  c. in the parameters field, write input parameters with : filename, filedata
  d. write this code in the javascript code field  :
  
  /* globals
  $http - Service for AJAX calls 
  CONSTS - CONSTS.apiUrl for Backands API URL
  Config - Global Configuration
  socket - Send realtime database communication
  files - file handler, performs upload and delete of files
  request - the current http request
*/
'use strict';
function backandCallback(userInput, dbRow, parameters, userProfile) {
  console.log(userProfile); // gets the current user role and id that enables you to perform security restrictions
    // upload file
    if (request.method == "POST"){
        //var url = 'test';
        //return {"url": url};
        
        var url = files.upload(parameters.filename, parameters.filedata);
        return {"url": url};
    }
    // delete file
    else if (request.method == "DELETE"){
        files.delete(parameters.filename);
        return {};    
    }

}
  
for future research see this doc: http://docs.backand.com/en/latest/apidocs/files/index.html

4- To run starter, download zip or run ionic start:

ionic start myApp https://github.com/abdulMuhit/IonicBackandStorage
cd myApp

5 - change application name n token in /js/app.js file to your new application name & token.

6 - Run with ionic serve function

ionic serve

7 - Login as guest or with user and your password in your backand app


