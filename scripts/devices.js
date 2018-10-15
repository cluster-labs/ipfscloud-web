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
    
    var md = new MobileDetect(window.navigator.userAgent);

    //Initialize elements
    
    var folders = document.getElementById("folders");
    var data_items = document.getElementById("data_items");
    var bar = document.getElementById("upload_status");
    var progress_bar = document.getElementById("upload_progress");
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
      window.location = "http://eth.ipfscloud.store";
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
            document.getElementById("loader").style.display = "none";
            document.getElementById("signup").style.display = "block";
            document.getElementById("documents").style.display = "none";
            document.getElementById("login_methods").innerHTML = '<div id="gSignInWrapper"> <div id="customBtn" class="customGPlusSignIn" onclick="signInAnonymously()"> &nbsp;&nbsp;<span class="icon"><img src="./images/anonymous.png" width="38px" height="38px"></span> <span class="buttonText">Anonymous</span><br> </div> </div> <br> <div id="gSignInWrapper"> <div id="customBtn" class="customGPlusSignIn" onclick="signInViaGoogle()"> &nbsp;&nbsp;<span class="icon"><img src="./images/google.jpeg" width="38px" height="38px"></span> <span class="buttonText">Google</span> </div> </div> <br> <div id="gSignInWrapper"> <div id="customBtn" class="customGPlusSignIn" onclick="signInViaMetamask()"> &nbsp;&nbsp;<span class="icon"><img src="./images/metamask.png" width="38px" height="38px"></span> <span class="buttonText">Metamask</span> </div> </div>';

          }
        });

    $("#logout").on("click", function(){
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
        window.location = "login.html"
      }).catch(function(error) {
        // An error happened.
        console.log("User Google Sign out failed: "+error);
      });
    });

    function checkForFirebaseAccount(uid){
      console.log("ENTERRED "+uid);
      var userDocRef = firestore.doc("users/"+uid);      

      userDocRef.onSnapshot((doc) => {
        if(doc && doc.exists){
          data = doc.data();
          //if the user account already exists, Show the devices used
          showDevices(userDocRef);

          checkForNewDevice(data, userDocRef);
        }
        else{
          console.log("CREATING: "+uid);
          //if user is a new user, save the user to the firebase cloud

          var d = new Date();

          userDocRef.set({
            "documents": {"Qme28puvbzTqixVPcCQ2vTDvUR7uL6ZvxwUmHiGVDGT3ge":{"ipfsHash": "Qme28puvbzTqixVPcCQ2vTDvUR7uL6ZvxwUmHiGVDGT3ge", "contentType": "image/png", "name": "test.png", "size": "32 KB", "isSavedOnBlockchain": false}},
            "shared": {},
            "private": {},
            "devicesUsed": [{"device": md.ua, "datetime": d}],
            "isEncryptionKeySet": false
          }).then(() => {
            ////user saved to cloud

            console.log("New User Successfully added to the cloud.");
            
            //
            showDevices(userDocRef);

          }).catch((error) => {
            //failed to save user to the cloud. 
            console.log("Some error occurred while saving new user to cloud: "+error);
          });
        }
      });

    }

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

    function showDevices(userDocRef){
      userDocRef.get()
      .then((doc)=>{
        if(doc && doc.exists){
          var data = doc.data();
          var myDevices = data.devicesUsed;

          console.log(myDevices);

          var devices = "";

          myDevices.forEach((device)=>{

            devices = devices + '<div class="card">'+
                          '<div class="card-body">'+
                              '<b><font color="blue">Device: </font></b><span>'+device.device.split('(')[1].split(')')[0]+
                              '</span><br><b><font color="blue">Browser: </font></b><span>'+device.device.split(')')[2].split(' ')[1]+
                          '</span></div>'+
                        '</div>';

          });
          

          folderHolder.innerHTML = devices;


        }
      })
      .catch((error)=>{
        console.log("Some error occurred while showing devices: "+error);
      });
    }