// Initialize Firebase
   var production_config = {
      apiKey: "AIzaSyCl98x3fJQuvdBuKtWOd8AHHigYASaCSPw",
      authDomain: "ipfscloud-da4e7.firebaseapp.com",
      databaseURL: "https://ipfscloud-da4e7.firebaseio.com",
      projectId: "ipfscloud-da4e7",
      storageBucket: "ipfscloud-da4e7.appspot.com",
      messagingSenderId: "243693028930"
    };

    var development_config = {
      apiKey: "AIzaSyCj0zWOdlwOc8rBWrTWzEf_Ahgu6akFYXo",
      authDomain: "ipfscloud-49862.firebaseapp.com",
      databaseURL: "https://ipfscloud-49862.firebaseio.com",
      projectId: "ipfscloud-49862",
      storageBucket: "ipfscloud-49862.appspot.com",
      messagingSenderId: "811456726438"
  };



    firebase.initializeApp(development_config);
    var firestore = firebase.firestore();
    const settings = {timestampsInSnapshots: true}
    firestore.settings(settings);
    //Initialize Ipfs
    
    const ipfs = new IpfsApi({ host: "ipfs.infura.io", port: 5001, protocol: "https" });
    var firebaseActiveAccount;

    var md = new MobileDetect(window.navigator.userAgent);

    //Initialize elements
    var files = document.getElementById("files");
    var folders = document.getElementById("folders");
    var data_items = document.getElementById("data_items");
    var bar = document.getElementById("upload_status");
    var progress_bar = document.getElementById("upload_progress");
    var progress_value = document.getElementById("progress-value");
    var upload_status_text = document.getElementById("upload_status_text");
    var fileHolder = document.getElementById("fileHolder");
    var folderHolder = document.getElementById("folderHolder");
    var folderHolderTitle = document.getElementById("folderHolderTitle");
    var title = document.getElementById("title");
    var copyText = document.getElementById("clipboard");
    var shareable_link_popup = document.getElementById("shareable_link_popup");
    var notifications_pill = document.getElementById("notifications_pill");
    var userIdLabel = document.getElementById("userId");
    var profile_pic = document.getElementById("profile_pic");
    var navbar_options = document.getElementById("navbar_options");

    var icons = {
      "3ds":"3ds.png",
      "cad":"cad.png",
      "dmg":"dmg.png",
      "gif":"gif.png",
      "js":"js.png",
      "pdf":"pdf.png",
      "ps":"ps.png",
      "txt":"txt.png",
      "aac":"aac.png",
      "cdr":"cdr.png",
      "doc":"doc.png",
      "html":"html.png",
      "midi":"midi.png",
      "php":"php.png",
      "raw":"raw.png",
      "wmv":"wmv.png",
      "ai":"ai.png",
      "css":"css.png",
      "eps":"eps.png",
      "indd":"indd.png",
      "mov":"mov.png",
      "png":"png.png",
      "sql":"sql.png",
      "xls":"xls.png",
      "avi":"avi.png",
      "dat":"dat.png",
      "fla":"fla.png",
      "iso":"iso.png",
      "mp3":"mp3.png",
      "ppt":"ppt.png",
      "svg":"svg.png",
      "xml":"xml.png",
      "bmp":"bmp.png",
      "dll":"dll.png",
      "flv":"flv.png",
      "jpg":"jpg.png",
      "mpg":"mpg.png",
      "psd":"psd.png",
      "tif":"tif.png",
      "zip":"zip.png",

      "jpeg":"jpg.png",
      "mp4":"mov.png",
      "webp":"gif.png",
      "plain":"txt.png",
      "undefined": "txt.png",
      "javascript": "js.png"
    };

    var highlighted_keys = [];

    function isUserSignedIn() {
      return !!firebase.auth().currentUser;
    }

    //Authentication methods

    //GOOGLE LOGIN
    function signInViaGoogle(){
      if(!isUserSignedIn()){
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/appstate');
      //provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      firebase.auth().useDeviceLanguage();
      provider.setCustomParameters({
        'login_hint': 'user@example.com'
      });

      firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        
        console.log("User: "+user.uid);

        checkForFirebaseAccount(user.uid);
        
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
      }
      else{
        console.log("User is logged in.")
      }
    }

    //ANONYMOUS LOGIN
    function signInAnonymously(){

      document.getElementById("login_methods").innerHTML = '<center><h6>Hang tight... Signing you up.</h6><br><img src="./gifs/loader.gif" width="215px" height="215dip"/></center>';

      firebase.auth().signInAnonymously().catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        
        if(errorMessage){
          alert("Some error occurred while signing in: "+ errorMessage);
          document.getElementById("login_methods").innerHTML = '<center><h6>Oops... We messed up.</h6><img src="./gifs/error.gif"  width="215px" height="215dip"/></center>';
        }

        checkForFirebaseAccount(user.uid);
      });
    }


    //METAMASK LOGIN
    function signInViaMetamask(){
      window.open("http://eth.ipfscloud.store");
    }



    //USER LOGIN STATE LISTNER
    firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            // User is signed in.
            document.getElementById("loader").style.display = "none";
            document.getElementById("signup").style.display = "none";
            document.getElementById("documents").style.display = "block";
            document.getElementById("login_methods").innerHTML = '<div id="gSignInWrapper"> <div id="customBtn" class="customGPlusSignIn" onclick="signInAnonymously()"> &nbsp;&nbsp;<span class="icon"><img src="./images/anonymous.png" width="38px" height="38px"></span> <span class="buttonText">Anonymous</span><br> </div> </div> <br> <div id="gSignInWrapper"> <div id="customBtn" class="customGPlusSignIn" onclick="signInViaGoogle()"> &nbsp;&nbsp;<span class="icon"><img src="./images/google.jpeg" width="38px" height="38px"></span> <span class="buttonText">Google</span> </div> </div> <br> <div id="gSignInWrapper"> <div id="customBtn" class="customGPlusSignIn" onclick="signInViaMetamask()"> &nbsp;&nbsp;<span class="icon"><img src="./images/metamask.png" width="38px" height="38px"></span> <span class="buttonText">Metamask</span> </div> </div>';

            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            console.log("UserId: " + uid);

            firebaseActiveAccount = uid;

            user.providerData.forEach(function (profile) {
              console.log("Sign-in provider: " + profile.providerId);
              console.log("  Provider-specific UID: " + profile.uid);
              console.log("  Name: " + profile.displayName);
              console.log("  Email: " + profile.email);
              console.log("  Photo URL: " + profile.photoURL);
              if(profile.photoURL){
                profile_pic.src = profile.photoURL;
              }
            });

            if(firebaseActiveAccount){
              checkForFirebaseAccount(firebaseActiveAccount);
              navbar_options.style = '';
              var username = firebase.auth().currentUser.displayName;

              if(username){
                userIdLabel.innerHTML = (username.length <=10) ? username : username.substring(0,10)+"...";
              }else{
                userIdLabel.innerHTML = firebaseActiveAccount.substring(0,10)+"...";
              }
              
            }
            
            //saving data to cookies
            document.cookie = "userId="+uid+"; expires=Thu, 31 Dec 2130 12:00:00 UTC; path=/";

          } else {
            /*document.getElementById("loader").style.display = "none";
            document.getElementById("signup").style.display = "block";
            document.getElementById("documents").style.display = "none";
            document.getElementById("login_methods").innerHTML = '<div id="gSignInWrapper"> <div id="customBtn" class="customGPlusSignIn" onclick="signInAnonymously()"> &nbsp;&nbsp;<span class="icon"><img src="./images/anonymous.png" width="38px" height="38px"></span> <span class="buttonText">Anonymous</span><br> </div> </div> <br> <div id="gSignInWrapper"> <div id="customBtn" class="customGPlusSignIn" onclick="signInViaGoogle()"> &nbsp;&nbsp;<span class="icon"><img src="./images/google.jpeg" width="38px" height="38px"></span> <span class="buttonText">Google</span> </div> </div> <br> <div id="gSignInWrapper"> <div id="customBtn" class="customGPlusSignIn" onclick="signInViaMetamask()"> &nbsp;&nbsp;<span class="icon"><img src="./images/metamask.png" width="38px" height="38px"></span> <span class="buttonText">Metamask</span> </div> </div>';*/
            window.location = "login.html"
          }
        });



    function checkForFirebaseAccount(uid){
      console.log("ENTERRED "+uid);
      var userDocRef = firestore.doc("users/"+uid);      

      userDocRef.get().then((doc) => {
        if(doc && doc.exists){
          var data = doc.data();
          //if the user account already exists

          //loading account data
          loadUserData(userDocRef);

          //check for new devices
          checkForNewDevice(data, userDocRef);
        }
        else{
          console.log("CREATING: "+uid);

          var d = new Date();

          //if user is a new user, save the user to the firebase cloud
          userDocRef.set({
            "documents": {"Qme28puvbzTqixVPcCQ2vTDvUR7uL6ZvxwUmHiGVDGT3ge":{"ipfsHash": "Qme28puvbzTqixVPcCQ2vTDvUR7uL6ZvxwUmHiGVDGT3ge", "contentType": "image/png", "name": "test.png", "size": "32 KB", "isSavedOnBlockchain": false}},
            "shared": {},
            "private": {},
            "devicesUsed": [{"device": md.ua, "datetime": d}],
            "isEncryptionKeySet": false
          }).then(() => {
            ////user saved to cloud

            console.log("New User Successfully added to the cloud.");
            

            //loading account data
            loadUserData(userDocRef);

          }).catch((error) => {
            //failed to save user to the cloud. 
            console.log("Some error occurred while saving new user to cloud: "+error);
          });
        }
      });

    }


    //CHECKING AND ADDING NEW DEVICES USED
    function checkForNewDevice(doc, userDocRef){
      if(doc.devicesUsed!=null){

        var isDeviceUsed = false;

        for(var i=0; i < doc.devicesUsed.length; i++){
          if(doc.devicesUsed[i].device == md.ua){
            isDeviceUsed = true;
            break;
          }
        }

        if(!isDeviceUsed){
          addNewDevice(userDocRef, doc);
        }
      }
      else{
        var d = new Date();

        userDocRef.update({"devicesUsed": [{"device": md.ua, "datetime": d}]})
        .then(() => {
          console.log("New device detected");
        })
        .catch((error)=>{
          console.log("Some error occurred while adding a new device to usedDevices: "+error);
        });
      }
    }

    function addNewDevice(userDocRef, doc){
           //adding a new devices
          var d = new Date();

          var devices = doc.devicesUsed;
          devices.push({
            "device": md.ua,
            "datetime": d
          });
          userDocRef.update({"devicesUsed": devices})
          .then(()=>{
            console.log("New device detected");
          })
          .catch((error)=>{
            console.log("Some error occurred while adding a new device to usedDevices: "+error);
          });
    }

    //UPLOADING FILES

    var count = 0;
    var upload_complete = false;

    files.addEventListener("drop", function(event){
      

      }, false);


    data_items.addEventListener("dragover", function(event){
      event.preventDefault();
      data_items.style = 'background-color: #C1E1DE; border: 3px solid blue; width: 100%; height:100%;';
    }, false);
    data_items.addEventListener("dragleave",change_back_data_items, false);
    data_items.addEventListener("drop", function(event){

      data_items.style = '';
      event.preventDefault();

      var items = event.dataTransfer.items;

      if(items[0].webkitGetAsEntry().isDirectory){
        uploadFolder(event);
      }
      else{
        uploadFile(event);
      }
    });


    function uploadFolder(event){
      upload_status_text.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Uploading...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      progress_bar.classList.remove("bg-success");

      removeProgressBarClass1();
      removeProgressBarClass2();
      bar.classList.add("slideInUp");
      var d = new Date();
      var n = d.getMilliseconds();
      console.log(d +" | "+n);

      var totalSize = 0;
      count = 0;

      getDroppedOrSelectedFiles(event).
      then((files)=>{
        console.log(files);
        var result = [];
        var details = [];
        files.forEach((x)=>{
          result.push(x.fileObject);
          totalSize = totalSize + x.size;
          delete x["fileObject"];
          details.push(x);
        });

        console.log(details);
        uploadFolderToServer(result, details);

        var perSecondDelay = Math.round(((totalSize/24.9232768))/100);
        

        if(perSecondDelay<10){
          perSecondDelay = 10;
        }
        console.log("chunksize: "+perSecondDelay);

        function upload(){      

        setTimeout(function(){
                count = count + 1;
                
                if(!upload_complete){
                  if(count == 99){
                    upload_status_text.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Pinning...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                  }else{
                    progress_bar.style = "width: "+count+"%";
                    progress_value.innerHTML = count;
                    upload();
                  }
                }else{
                }
              },perSecondDelay);
        }
        

        progress_bar.style = "display: block";
        upload();

      });
    }

    function uploadFile(event){
      count = 0;
      upload_complete = false;
      files.style = '';

      upload_status_text.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Uploading...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      progress_bar.classList.remove("bg-success");

      event.preventDefault();
      //console.log("here");
      removeProgressBarClass1();
      removeProgressBarClass2();
      bar.classList.add("slideInUp");
      var d = new Date();
      var n = d.getMilliseconds();
      console.log(d +" | "+n);
      //23.1486449
      //bar.classList.remove("slideInUp");

      var items = event.dataTransfer.files;
      console.log(items[0]);
      uploadFileToServer(items[0]);

      var perSecondDelay = Math.round(((items[0].size/24.9232768))/100);

      if(perSecondDelay<10){
        perSecondDelay = 10;
      }
      console.log("chunksize: "+perSecondDelay);

      function upload(){

      setTimeout(function(){
              count = count + 1;
              
              if(!upload_complete){
                if(count == 99){
                  upload_status_text.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Pinning...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                }else{
                  progress_bar.style = "width: "+count+"%";
                  progress_value.innerHTML = count;
                  upload();
                }
              }else{
              }
            },perSecondDelay);
      }

      

      progress_bar.style = "display: block";
      upload();
    }


    

    /*function change_data_items(event) {
      event.preventDefault();
      data_items.style = 'background-color: #C1E1DE; border: 3px solid blue; width: 100%; height:100%;';
    };*/

    function change_back_data_items() {
      data_items.style = '';
    };

    function removeProgressBarClass1(){
      bar.classList.remove("slideInUp");
    }

    function removeProgressBarClass2(){
      bar.classList.remove("hidden");
    }

    function hideProgressBar(){
      bar.classList.add("hidden");
    }

    function uploadFileToServer(file){
      console.log("Started upload...");
        var formData = new FormData();
        formData.append("profile-pic", file);
            
        $.ajax({
          url: "http://api.ipfscloud.store/file",
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          success: function (data) {
              console.log(data);

              addHashToFireBase(firebaseActiveAccount, data.hash, file.name, data.size, file.type);

              progress_bar.style = "width: 100%";
              progress_value.innerHTML = 100;
              upload_status_text.innerHTML = "Upload Complete";
              progress_bar.classList.add("bg-success");


              upload_complete = true;
              var d = new Date();
              var n = d.getMilliseconds();
              console.log(d +" | "+n) ;
              
              setTimeout(hideProgressBar,2000);

              
          },
          error: function(xhr, ajaxOptions, thrownError){
            console.log("error: "+thrownError);
          }
      });
      }


      function uploadFolderToServer(files, details){
        console.log("Started upload...");
        var formData = new FormData();
        
        formData.append("details", JSON.stringify(details));

        count = 0;

        files.forEach((x)=>{
          formData.append("file_"+count, x);
          count++;
        });

        

        $.ajax({
          url: "http://api.ipfscloud.store/folder",
          type: "POST",
          enctype: 'multipart/form-data',
          data: formData,
          processData: false,
          contentType: false,
          success: function (data) {
              
              console.log(data);

              progress_bar.style = "width: 100%";
              progress_value.innerHTML = 100;
              upload_status_text.innerHTML = "Upload Complete";
              progress_bar.classList.add("bg-success");


              upload_complete = true;
              var d = new Date();
              var n = d.getMilliseconds();
              console.log(d +" | "+n) ;
              
              setTimeout(hideProgressBar,2000);

              addFolderToFireBase(firebaseActiveAccount, data.result[data.result.length-1].hash, data.result[data.result.length-1].path, data.result, data.result[data.result.length-1].size, "clusterlabs.ipfscloud/folder");

              
          },
          error: function(xhr, ajaxOptions, thrownError){
            console.log("error: "+thrownError);
          }
      });
      }


    function addHashToFireBase(pubKey, hash, fileName, fileSize, fileType){
      
      fileSize = bytesToSize(fileSize);

      var userDocRef = firestore.doc("users/"+pubKey);
      userDocRef.get().then((doc) => {
        if(doc && doc.exists){
          var myData = doc.data();
          var documents = myData.documents;
          console.log("DOCUMENTS: "+documents);


          fetch("https://gateway.ipfs.io/ipfs/"+hash, {method:"HEAD"})
              .then(response => response.headers.get("Content-Type"))
              .then(type => `${type.replace(/.+\/|;.+/g, "")}`)
              .then(result => {
                documents[hash] =  {"ipfsHash": hash, "isSavedOnBlockchain": false, "name": fileName, "size": fileSize , "contentType": result};

                userDocRef.update({"documents": documents}).then(() => {
                  console.log("New document successfully added to the cloud.");
                }).catch((error) => {
                  console.log("Some error occured while adding new document to the cloud: "+error);
                });
              });
        }
      })
      
    }


    function addFolderToFireBase(pubKey, hash, fileName, contents, fileSize, fileType){
      
      fileSize = bytesToSize(fileSize);

      var userDocRef = firestore.doc("users/"+pubKey);
      userDocRef.get().then((doc) => {
        if(doc && doc.exists){
          var myData = doc.data();
          var documents = myData.documents;
          console.log("DOCUMENTS: "+documents);

          documents[hash] =  {"ipfsHash": hash, "isSavedOnBlockchain": false, "name": fileName, "size": fileSize , "contents": contents, "contentType": fileType};

                userDocRef.update({"documents": documents}).then(() => {
                  console.log("New document successfully added to the cloud.");
                }).catch((error) => {
                  console.log("Some error occured while adding new document to the cloud: "+error);
                });
          
        }
      })
      
    }


    function bytesToSize(bytes) {
       var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
       if (bytes == 0) return '0 Byte';
       var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
       return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };


    //LOADING USER DATA
    function loadUserData(userDocRef){
      console.log("Loading user data...");
      

      userDocRef.onSnapshot((doc) => {
        if(doc && doc.exists){
          var data = doc.data();

          var obj = data.documents;
          var i = 0;
          var j = 0;
          //Fetching and displating current uploaded documents
          var str = "";
          var str_folders = "";
          var name = "";

          fileHolder.innerHTML = "<center><img src='./gifs/grey_loader.gif'></center>";
          folderHolder.innerHTML = "<center><img src='./gifs/grey_loader.gif'></center>";

          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              //key: hash
              //val: {"ipfsHash": hash, "isSavedOnBlockchain": false}

              var val = obj[key];
              console.log("val: "+val);

              if(val.contentType == "clusterlabs.ipfscloud/folder"){

              if(j%6==0){
                str_folders = str_folders + '<div class="row">';
              }

              name = "";

              if(val.name.length<=16){
                name = val.name;
              }
              else{
                name = val.name.substring(0,16)+'...';
              }

              str_folders = str_folders + '<div class="col-lg-2 col-md-6 col-sm-6 mb-4 col-6 folder" >'+
                '<div class="stats-small stats-small--1 card card-small folder root_'+val.name+' parent_'+key+'" id="card_select_'+key+'">'+
                  '<div class="card-body p-0 d-flex folder root_'+val.name+' parent_'+key+'" id="card_highlight_'+key+'">'+
                    '<div class="d-flex flex-column m-auto folder root_'+val.name+' parent_'+key+'" id="card_select_'+key+'">'+
                      '<div class="stats-small__data text-center folder root_'+val.name+' parent_'+key+'" id="card_select_'+key+'">'+
                        '<h6 class="stats-small__value count my-3 folder root_'+val.name+' parent_'+key+'" id="card_select_'+key+'">'+
                        '<i class="material-icons root_'+val.name+' parent_'+key+'" id="card_select_'+key+'">folder</i>&nbsp;'+val.name+'</h6>'+
                      '</div>'+
                    '</div>'+
                  '</div>'+
                '</div>'+
              '</div>';
              

              if((j+1)%6 == 0){
                str_folders = str_folders + '</div>';
              }
              
              j++;

              }



              else{

              if(i%6==0){
                str = str + '<div class="row">';
              }

              var src = "";

              var type = val.contentType.split('/')[val.contentType.split('/').length-1];


              if((type == "png") || (type == "jpeg") || (type == "jpg") || (type == "gif")
                || (type == "ico") || (type == "tif") || (type == "webp") || (type == "jfif")
                || (type == "bmp") || (type == "bat") || (type == "bpg") || (type == "hfif")
                || (type == "ppm") || (type == "pgm") || (type == "pbm") || (type == "pnm")
               ){
                src = "https://gateway.ipfs.io/ipfs/"+key;
              }
              else{
                console.log(type);
                src = "./png/"+icons[type];
              }

              var name = "";

              if(val.name.length<=16){
                name = val.name;
              }
              else{
                name = val.name.substring(0,16)+'...';
              }


              str = str + '<div class="col-lg-2 col-md-6 col-sm-6 mb-4 col-6">'+
                      '<div class="stats-small stats-small--1 card card-small file" id="card_select_'+key+'">'+
                        '<div class="card file" id="card_select_'+key+'">'+
                            '<img src="'+src+'" height="139px" width="100%" class="blog-overview-stats-small-2 file" id="card_select_'+key+'" value="file">'+
                            '<center class="file" id="card_highlight_'+key+'"><span class="stats-small__label ">'+name+'</span><br>'+
                            '<small>'+val.size+'</small></center>'+
                        '</div>'+
                      '</div>'+
                    '</div>';
              

              if((i+1)%6 == 0){
                str = str + '</div>';
              }
              
              i++;

            }
            }
          }
          

          
          if((str_folders.length==0) && (str.split('card-small').length == 2)){
            if(md.ua.includes("Android") || md.ua.includes("iPhone") || md.ua.includes("iPad")){
              str_folders = str_folders +'<p><center>Use the plus button to add Files and Folders</center></p>';
            }
            else{
            str_folders = str_folders + '<p><center><h6>Drag and drop your files and folders here<br>or<br> Use the plus button.</h6#center></p>';
            }
          }
          else if(str_folders.length==0){
            str_folders = str_folders +
            '<p><center><h6>Drag and drop your folders here<h6>or<h6>Use the plus button.</h6></center></p>';
          }
          

          

          fileHolder.innerHTML = str;
          folderHolder.innerHTML = str_folders;


        }
      });
    }

    function updateNotificationPill(){
      notifications_pill.parentNode.removeChild(notifications_pill);
    }

    function intiateFolderUpload(){
      upload_status_text.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Uploading...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      progress_bar.classList.remove("bg-success");

      removeProgressBarClass1();
      removeProgressBarClass2();
      bar.classList.add("slideInUp");
      var d = new Date();
      var n = d.getMilliseconds();
      console.log(d +" | "+n);

      var totalSize = 0;

      getDroppedOrSelectedFiles(event).
      then((files)=>{
        console.log(files);
        var result = [];
        var details = [];
        files.forEach((x)=>{
          result.push(x.fileObject);
          totalSize = totalSize + x.size;
          delete x["fileObject"];
          details.push(x);
        });

        console.log(details);
        uploadFolderToServer(result, details);

        var perSecondDelay = Math.round(((totalSize/24.9232768))/100);
        

        if(perSecondDelay<10){
          perSecondDelay = 10;
        }
        console.log("chunksize: "+perSecondDelay);

        function upload(){      

        setTimeout(function(){
                count = count + 1;
                
                if(!upload_complete){
                  if(count == 99){
                    upload_status_text.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Pinning...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                  }else{
                    progress_bar.style = "width: "+count+"%";
                    progress_value = count;
                    upload();
                  }
                }else{
                }
              },perSecondDelay);
        }
        

        progress_bar.style = "display: block";
        upload();

      });
    }

    function intiateFileUpload(){
      count = 0;
      upload_complete = false;
      //files.style = '';
      
      upload_status_text.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Uploading...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      progress_bar.classList.remove("bg-success");

      //event.preventDefault();
      //console.log("here");
      removeProgressBarClass1();
      removeProgressBarClass2();
      bar.classList.add("slideInUp");
      var d = new Date();
      var n = d.getMilliseconds();
      console.log(d +" | "+n);
      //23.1486449
      //bar.classList.remove("slideInUp");
      var addFileCard = document.getElementById("addFileCard");
      var items = addFileCard.files[0];
      console.log(items);
      uploadFileToServer(items);

      var perSecondDelay = Math.round(((items.size/11212.6466)*1000)/100);

      if(perSecondDelay<10){
        perSecondDelay = 10;
      }
      console.log("chunksize: "+perSecondDelay);

      function upload(){


      setTimeout(function(){
              count = count + 1;
              
              if(!upload_complete){
                if(count == 99){
                  upload_status_text.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Pinning...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                }else{
                  progress_bar.style = "width: "+count+"%";
                  progress_value.innerHTML = count;
                  upload();
                }
              }else{
              }
            },perSecondDelay);
      }

      

      progress_bar.style = "display: block";
      upload();
    }



    //UPLOADING FOLDER
    const DEFAULT_FILES_TO_IGNORE = [
      '.DS_Store', // OSX indexing file
      'Thumbs.db'  // Windows indexing file
    ];

    // map of common (mostly media types) mime types to use when the browser does not supply the mime type
    const EXTENSION_TO_MIME_TYPE_MAP = {
      avi: 'video/avi',
      gif: 'image/gif',
      ico: 'image/x-icon',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      mkv: 'video/x-matroska',
      mov: 'video/quicktime',
      mp4: 'video/mp4',
      pdf: 'application/pdf',
      png: 'image/png',
      zip: 'application/zip'
    };

    function shouldIgnoreFile(file) {
      return DEFAULT_FILES_TO_IGNORE.indexOf(file.name) >= 0;
    }

    function copyString(aString) {
      return ` ${aString}`.slice(1);
    }

    function traverseDirectory(entry) {
      const reader = entry.createReader();
      // Resolved when the entire directory is traversed
      return new Promise((resolveDirectory) => {
        const iterationAttempts = [];
        const errorHandler = () => {};
        function readEntries() {
          // According to the FileSystem API spec, readEntries() must be called until
          // it calls the callback with an empty array.
          reader.readEntries((batchEntries) => {
            if (!batchEntries.length) {
              // Done iterating this particular directory
              resolveDirectory(Promise.all(iterationAttempts));
            } else {
              // Add a list of promises for each directory entry.  If the entry is itself
              // a directory, then that promise won't resolve until it is fully traversed.
              iterationAttempts.push(Promise.all(batchEntries.map((batchEntry) => {
                if (batchEntry.isDirectory) {
                  return traverseDirectory(batchEntry);
                }
                return Promise.resolve(batchEntry);
              })));
              // Try calling readEntries() again for the same dir, according to spec
              readEntries();
            }
          }, errorHandler);
        }
        // initial call to recursive entry reader function
        readEntries();
      });
    }

    // package the file in an object that includes the fullPath from the file entry
    // that would otherwise be lost
    function packageFile(file, entry) {
      let fileTypeOverride = '';
      // handle some browsers sometimes missing mime types for dropped files
      const hasExtension = file.name && file.name.lastIndexOf('.') !== -1;
      if (hasExtension && !file.type) {
        const fileExtension = (file.name || '').split('.').pop();
        fileTypeOverride = EXTENSION_TO_MIME_TYPE_MAP[fileExtension];
      }
      return {
        fileObject: file, // provide access to the raw File object (required for uploading)
        fullPath: entry ? copyString(entry.fullPath) : file.name,
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        name: file.name,
        size: file.size,
        type: file.type ? file.type : fileTypeOverride,
        webkitRelativePath: file.webkitRelativePath
      };
    }

    function getFile(entry) {
      return new Promise((resolve) => {
        entry.file((file) => {
          resolve(packageFile(file, entry));
        });
      });
    }

    function handleFilePromises(promises, fileList) {
      return Promise.all(promises).then((files) => {
        files.forEach((file) => {
          if (!shouldIgnoreFile(file)) {
            fileList.push(file);
          }
        });
        return fileList;
      });
    }

     function getDataTransferFiles(dataTransfer) {
      const dataTransferFiles = [];
      const folderPromises = [];
      const filePromises = [];

      [].slice.call(dataTransfer.items).forEach((listItem) => {
        if (typeof listItem.webkitGetAsEntry === 'function') {
          const entry = listItem.webkitGetAsEntry();

          if (entry) {
            if (entry.isDirectory) {
              folderPromises.push(traverseDirectory(entry));
            } else {
              filePromises.push(getFile(entry));
            }
          }
        } else {
          dataTransferFiles.push(listItem);
        }
      });
      if (folderPromises.length) {
        const flatten = (array) => array.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
        return Promise.all(folderPromises).then((fileEntries) => {
          const flattenedEntries = flatten(fileEntries);
          // collect async promises to convert each fileEntry into a File object
          flattenedEntries.forEach((fileEntry) => {
            filePromises.push(getFile(fileEntry));
          });
          return handleFilePromises(filePromises, dataTransferFiles);
        });
      } else if (filePromises.length) {
        return handleFilePromises(filePromises, dataTransferFiles);
      }
      return Promise.resolve(dataTransferFiles);
    }

    /**
     * This function should be called from both the onDrop event from your drag/drop
     * dropzone as well as from the HTML5 file selector input field onChange event
     * handler.  Pass the event object from the triggered event into this function.
     * Supports mix of files and folders dropped via drag/drop.
     *
     * Returns: an array of File objects, that includes all files within folders
     *   and subfolders of the dropped/selected items.
     */
     function getDroppedOrSelectedFiles(event) {
      const dataTransfer = event.dataTransfer;
      if (dataTransfer && dataTransfer.items) {
        return getDataTransferFiles(dataTransfer).then((fileList) => {
          return Promise.resolve(fileList);
        });
      }
      const files = [];
      const dragDropFileList = dataTransfer && dataTransfer.files;
      const inputFieldFileList = event.target && event.target.files;
      const fileList = dragDropFileList || inputFieldFileList || [];
      // convert the FileList to a simple array of File objects
      for (let i = 0; i < fileList.length; i++) {
        files.push(packageFile(fileList[i]));
      }
      return Promise.resolve(files);
    }


    //EXPLORING A FOLDER

    function exploreFolder(key, rootDir){

      highlighted_keys = [];

      var dirTitle = "";
      var currentDir = "";
      var dirDepthCount = 0;

      dirTitle = dirTitle + "<font class='directoryTitle' onclick=\"goToIndex()\">IpfsCloud</font> &nbsp;>&nbsp;"

      rootDir.split("/").forEach((x)=>{
        dirDepthCount++;
        if(dirDepthCount>1){currentDir = currentDir + "/"; dirTitle = dirTitle + "&nbsp;>&nbsp;"}
        currentDir = currentDir + x;
        dirTitle = dirTitle + "<font class='directoryTitle' onclick=\"exploreFolder(\'"+key+"\',\'"+currentDir+"\')\">"+x+"</font>";
      });
      //console.log(dirDepthCount);
      title.innerHTML = dirTitle;
      folderHolder.innerHTML = "";
      fileHolder.innerHTML = "";

      folderHolder.innerHTML = "<center><img src='./gifs/grey_loader.gif'></center>";

      var rootDir = rootDir + "/";

      var userDocRef = firestore.doc("users/"+firebaseActiveAccount+"");

      userDocRef.get().then((doc) => {
        if(doc && doc.exists){
          var data = doc.data();

          var dirStructure = data.documents[key].contents;

          var j = 0;
          var i = 0;
          var str_folders = "";
          var str = "";

          dirStructure.forEach((element)=>{
              var elementPath = element.path;
              var dirArr = elementPath.split('/');
              dirArr.pop();
              
            if(dirArr.equals(rootDir.substring(0, rootDir.length-1).split('/'))){
              if(element.contentType == "clusterlabs.ipfscloud/folder"){
                //if the element is a folder

                if(j%6==0){
                    str_folders = str_folders + '<div class="row">';
                  }

                  var name = "";
                  var folderName = element.path.split('/')[element.path.split('/').length-1];
                  if(folderName.length<=13){
                    name = folderName;
                  }
                  else{
                    name = folderName.substring(10)+'...';
                  }

                  str_folders = str_folders + '<div class="col-lg-2 col-md-6 col-sm-6 mb-4 col-6 folder">'+
                    '<div class="stats-small stats-small--1 card card-small folder root_'+element.path+' parent_'+key+'" id="card_select_'+element.hash+'">'+
                      '<div class="card-body p-0 d-flex folder root_'+element.path+' parent_'+key+'" id="card_highlight_'+element.hash+'">'+
                        '<div class="d-flex flex-column m-auto folder root_'+element.path+' parent_'+key+'" id="card_select_'+element.hash+'">'+
                          '<div class="stats-small__data text-center folder root_'+element.path+' parent_'+key+'" id="card_select_'+element.hash+'">'+
                            '<h6 class="stats-small__value count my-3 folder root_'+element.path+' parent_'+key+'" id="card_select_'+element.hash+'">'+
                            '<i class="material-icons root_'+element.path+' parent_'+key+'" id="card_select_'+element.hash+'">folder</i>&nbsp;'+name+'</h6>'+
                          '</div>'+
                        '</div>'+
                      '</div>'+
                    '</div>'+
                  '</div>';


                  if((j+1)%6 == 0){
                    str_folders = str_folders + '</div>';
                  }
                  
                  j++;
              }
              else{
                //if the element is a file

                  if(i%6==0){
                    str = str + '<div class="row">';
                  }

                  var src = "";

                  var type = element.contentType.split("/")[1];


                  if((type == "png") || (type == "jpeg") || (type == "jpg") || (type == "gif")
                    || (type == "ico") || (type == "tif") || (type == "webp") || (type == "jfif")
                    || (type == "bmp") || (type == "bat") || (type == "bpg") || (type == "hfif")
                    || (type == "ppm") || (type == "pgm") || (type == "pbm") || (type == "pnm")
                   ){
                    src = "https://gateway.ipfs.io/ipfs/"+element.hash;
                  }
                  else{
                    console.log(type);
                    src = "./png/"+icons[type];
                  }

                  name = "";

                  var fileName = element.path.split('/')[element.path.split('/').length-1]

                  if(fileName.length<=16){
                    name = fileName;
                  }
                  else{
                    name = fileName.substring(0,16)+'...';
                  }

                  str = str + '<div class="col-lg-2 col-md-6 col-sm-6 mb-4 col-6">'+
                          '<div class="stats-small stats-small--1 card card-small file" id="card_select_'+element.hash+'">'+
                            '<div class="card file" id="card_select_'+element.hash+'">'+
                                '<img src="'+src+'" height="139px" width="100%" class="blog-overview-stats-small-2 file" id="card_select_'+element.hash+'"></a>'+
                                '<center class="file" id="card_highlight_'+element.hash+'"><span class="stats-small__label file">'+name+'</span><br>'+
                                '<small>'+bytesToSize(element.size)+'</small></center>'+
                            '</div>'+
                          '</div>'+
                        '</div>';
                  

                  if((i+1)%6 == 0){
                    str = str + '</div>';
                  }
                  
                  i++;
              }
              
            }
          });

          if(str.trim().length == 0){
            str = "<h6>No files here.</h6>";
          }
          if(str_folders.trim().length == 0){
            str_folders = "<font color='#c1c3c5'>No folders here.</font>";
          }

          console.log("STR: "+str);
          fileHolder.innerHTML = str;
          folderHolder.innerHTML = str_folders;
        }
        
        
    });

  }

    $(function() {
      $("#documents").click(function(e) {
        if (e.target.id.split('_')[0] == "card") {
          
          var shareable_link = document.getElementById("shareable_link");
          var share = document.getElementById("share");
          var view = document.getElementById("view");

          shareable_link.style = "display: block;";
          share.style = "display: block;";
          view.style = "display: block;";
          download.style = "display: block;"

          if(highlighted_keys.length>0){
            highlighted_keys.forEach((key)=>{
              document.getElementById("card_highlight_"+key).style = "";
              highlighted_keys.splice(highlighted_keys.indexOf(key),1);
            });
          }

          document.getElementById("card_highlight_"+e.target.id.split('_')[2]).style = "background: #C1E1DE";

          highlighted_keys.push(e.target.id.split('_')[2]);

          document.getElementById("clipboard").value = highlighted_keys[0];

        } else {
          
          var shareable_link = document.getElementById("shareable_link");
          var share = document.getElementById("share");
          var view = document.getElementById("view");

          highlighted_keys.forEach((key)=>{
            document.getElementById("card_highlight_"+key).style = "";
            highlighted_keys.splice(highlighted_keys.indexOf(key),1);
          });

          shareable_link.style = "display: none;";
          share.style = "display: none;";
          view.style = "display: none;";
          download.style = "display: none;";
          download.download = "";
          download.href = "";
        }
      });
    });

    $(function() {
      $("#documents").dblclick(function(e) {
        console.log(e.target.id);
        var id = e.target.id;
        if (id.split('_')[0] == "card") {
          var classList = document.getElementById(id).classList.value; 

          var _root, _parent;

          if(classList.includes("folder")){
            classList.split(" ").forEach((x)=>{
              if(x.includes('root') || x.includes('parent')){
                if(x.includes('root')){
                  _root = x.split("_")[1];
                }
                if(x.includes('parent')){
                  _parent = x.split("_")[1];
                }
                if(_root && _parent){
                  console.log(_parent,_root);
                  exploreFolder(_parent, _root);
                }
              }
            });

          }
          else{
            window.open("https://gateway.ipfs.io/ipfs/"+id.split("_")[2]);
          }
        }
      });
    });

    function copyLink(){

      var key = copyText.value;
      copyText.value = "https://gateway.ipfs.io/ipfs/"+key;

      copyText.select();
      document.execCommand("copy");

      copyText.value = key;
      
      shareable_link_popup.classList.remove("slideInUp");
      shareable_link_popup.classList.remove("hidden");
      shareable_link_popup.classList.add("slideInUp");

      setTimeout(linkCopiedPopup,3000);

    }

    function linkCopiedPopup(){
      shareable_link_popup.classList.add("hidden");
    }

    function shareViaEmail(){
      var subject;
      if(firebase.auth().currentUser.displayName){
        subject = firebase.auth().currentUser.displayName + " shared documents with you!";
      }
      else{
        subject = "Document shared with you!";
      }

      var email={
            to: document.getElementById("form1-pubKey").value.trim(),
            subject: subject,
            body: "Following documents are shared with you. https://gateway.ipfs.io/ipfs/"+document.getElementById("clipboard").value
       };
       $.ajax({
        url: "http://api.ipfscloud.store:3002/email",
        type: "POST",
        data: email,
        contentType: 'application/x-www-form-urlencoded',
        success: function (data) {
            console.log(data);
            document.getElementById("pubKey-body").innerHTML = "<center>Email sent successfully<br><img src='./gifs/done.gif' height = '50%' width = '50%'/></center>";
            
        },
        error: function(xhr, ajaxOptions, thrownError){
          document.getElementById("pubKey-body").innerHTML = '<center><h6>Oops... Some error occurred: '+thrownError+'</h6><img src="./gifs/error.gif"  width="150px" height="150dip"/></center>';
        }
    });

       firebase.auth().fetchProvidersForEmail(document.getElementById("form1-pubKey").value.trim())
        .then(providers => {
          if (providers.length === 0) {
            // this email hasn't signed up yet
          } else {
            // has signed up
          }
        });

    }

    function restoreEmailModal(){
      document.getElementById("pubKey-body").innerHTML = '<center> <div> <input type="email" class="form-control" id="form1-pubKey" placeholder="abc@gmail.com"> <p><font color="red" id="invalid_pubkey"></font></p> <button type="button" class="btn btn-primary" onclick="shareViaEmail()">Send</button> </div> </center>';
    }

    document.addEventListener('keydown', function(event) {
      if ((event.keyCode == 13) && (highlighted_keys.length>0)) {
        //console.log(document.getElementById("card_select_"+highlighted_keys[0]).classList.value.includes('folder'));
        if(document.getElementById("card_select_"+highlighted_keys[0]).classList.value.includes('folder')){

          var _root, _parent; 

          document.getElementById("card_select_"+highlighted_keys[0]).classList.value.split(" ").forEach((x)=>{
            if(x.includes('root') || x.includes('parent')){
              if(x.includes('root')){
                _root = x.split("_")[1];
              }
              if(x.includes('parent')){
                _parent = x.split("_")[1];
              }
              if(_root && _parent){
                //console.log(_parent,_root);
                exploreFolder(_parent, _root);
              }
            }
          });
        }
        else{
          window.open("https://gateway.ipfs.io/ipfs/"+highlighted_keys[0]);  
        }
      }
    });


    function viewDocument(){
      if(highlighted_keys.length){
        console.log(document.getElementById('card_select_'+document.getElementById('clipboard').value).classList.value.includes('folder'));
        window.open("http://gateway.ipfs.io/ipfs/"+document.getElementById('clipboard').value);
      }
    }

    $("#logout").on("click", function(){
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.location = "login.html"
      }).catch(function(error) {
        // An error happened.
        console.log("User Google Sign out failed: "+error);
      });
    });


    function downloadLink(){
      if(document.getElementById("card_select_"+highlighted_keys[0]).classList.value.includes("folder")){
        //if the element is a folder
         window.open("http://api.ipfscloud.store/folder/"+highlighted_keys[0]);
      }
      else{
        //if the element is a file
        fetch("https://gateway.ipfs.io/ipfs/"+highlighted_keys[0], {method:"HEAD"})
              .then(response => response.headers.get("Content-Type"))
              .then(type => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "https://gateway.ipfs.io/ipfs/"+highlighted_keys[0], true);
                xhr.responseType = "blob";
                xhr.onload = function(){
                    var urlCreator = window.URL || window.webkitURL;
                    var imageUrl = urlCreator.createObjectURL(this.response);
                    var tag = document.createElement('a');
                    tag.href = imageUrl;
                    tag.download = highlighted_keys[0]+"."+type;
                    document.body.appendChild(tag);
                    tag.click();
                    document.body.removeChild(tag);
                }
                xhr.send();
              });
            }
      
    }

    function goToIndex(){
      window.location = "index.html";
    }

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

    /*function showOptions(key){

      var shareable_link = document.getElementById("shareable_link");
      var share = document.getElementById("share");
      var view = document.getElementById("view");

      shareable_link.style = "display: block;";
      share.style = "display: block;";
      view.style = "display: block;";

      document.getElementById("card_"+key).style = "background: #C1E1DE";

      highlighted_keys.push(key);
    }*/

    /*$('html').click(function(){

      var shareable_link = document.getElementById("shareable_link");
      var share = document.getElementById("share");
      var view = document.getElementById("view");

      highlighted_keys.forEach((key)=>{
        document.getElementById("card_"+key).style = "";
        highlighted_keys.splice(highlighted_keys.indexOf(key),1);
      });

      shareable_link.style = "display: none;";
      share.style = "display: none;";
      view.style = "display: none;";
    });*/