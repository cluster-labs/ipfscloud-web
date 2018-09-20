// Initialize Firebase
   var config = {
      apiKey: "AIzaSyCl98x3fJQuvdBuKtWOd8AHHigYASaCSPw",
      authDomain: "ipfscloud-da4e7.firebaseapp.com",
      databaseURL: "https://ipfscloud-da4e7.firebaseio.com",
      projectId: "ipfscloud-da4e7",
      storageBucket: "ipfscloud-da4e7.appspot.com",
      messagingSenderId: "243693028930"
    };



    firebase.initializeApp(config);
    var firestore = firebase.firestore();
    const settings = {timestampsInSnapshots: true}
    firestore.settings(settings);
    //Initialize Ipfs
    
    const ipfs = new IpfsApi({ host: "ipfs.infura.io", port: 5001, protocol: "https" });

    


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
  "webp":"gif.png"
};


    var blockchainAccountActive, firebaseActiveAccount;
    ;

    var activePubKey;
    //check for active accounts
    
    

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
        //console.log("Access Token: "+result.credential.accessToken);

        initializeUser(user.uid);
        // ...
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

    // Returns true if a user is signed-in.
    function isUserSignedIn() {
      return !!firebase.auth().currentUser;
    }

    function checkLoginStatus(){

      
      document.getElementById("userId").innerHTML = "<h6> Current User: <font color='blue'>"+firebaseActiveAccount+"</font></h6>";

      if(!isUserSignedIn()){
        removeSignUpMenu();
        document.getElementById("login_methods").innerHTML = '<div id="gSignInWrapper"> <div id="customBtn" class="customGPlusSignIn" onclick="signInAnonymously()"> &nbsp;&nbsp;<span class="icon"><img src="https://gateway.ipfs.io/ipfs/QmdafK9AH3G134NRc2ErUBiWhmk79HEU7wB7CBHQbwScQy" width="38px" height="38px"></span> <span class="buttonText">Anonymous</span> </div> </div> <br> <div id="gSignInWrapper"> <div id="customBtn" class="customGPlusSignIn" onclick="signInViaGoogle()"> &nbsp;<span class="icon"><img src="https://gateway.ipfs.io/ipfs/QmUJnqvC6oX1oeTLHtvbw2zhATaifyPzkAqpTVYLcvnUaQ" width="38px" height="38px"></span> <span class="buttonText">Google</span> </div> </div>';
      }
      else{
        firebaseActiveAccount = firebase.auth().currentUser.uid;
        removeSignUpMenu();
        document.getElementById("login_methods").innerHTML = '<center><h6>Signed you up.</h6><br><img src="./gifs/done.gif" height="161px" width="215px"/></center>';
      }
    }


    //<br><small>*(For anonymous users)You will lose your data if you delete cookies for this site.</small>

    function signInAnonymously(){

      document.getElementById("login_methods").innerHTML = '<center><h6>Hang tight... Signing you up.</h6><br><img src="./gifs/loader.gif" width="215px" height="215dip"/></center>';

      firebase.auth().signInAnonymously().catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        
        if(errorMessage){
          alert("Some error occurred while signing in: "+ errorMessage);
          document.getElementById("login_methods").innerHTML = '<center><h6>Oops... We messed up.</h6><br><img src="./gifs/error.gif"  width="215px" height="215dip"/></center>';
        }
      });
    }

    function signInViaFacebook(){
      FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
      });

    }


    function removeSignUpMenu(){
      if(!isUserSignedIn()){
        document.getElementById("firebase_login").innerHTML = '<font color="blue" data-toggle="modal" data-target="#signUpModal">SignUp</font> to use the cloud';
      }
      else{
        document.getElementById("firebase_login").innerHTML = '';
      }
    }

    firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            // User is signed in.
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            console.log("UserId: " + uid);

            firebaseActiveAccount = uid;

            if(firebaseActiveAccount){
              checkForActiveAccounts(firebaseActiveAccount);
            }

            document.getElementById("userId").innerHTML = "<h6> Current User: <font color='blue'>"+firebaseActiveAccount+"</font></h6>";
            //saving data to cookies
            document.cookie = "userId="+uid+"; expires=Thu, 31 Dec 2130 12:00:00 UTC; path=/";
            removeSignUpMenu();
            document.getElementById("login_methods").innerHTML = '<center><h6>Signed you up.</h6><br><img src="./gifs/done.gif" height="161px" width="215px"/></center>';
          } else {
            checkLoginStatus();
          }
          // ...
        });



    function checkForActiveAccounts(){
      var userId = document.getElementById("userId");
        
        userId.innerHTML = "Current User: <font color='blue'>"+ firebaseActiveAccount + "</font>";

      //check for web3 account
      //checkForBlockchainAccount();
      //check for Firebase account
      checkForFirebaseAccount(firebaseActiveAccount);
    }

    /*function checkForBlockchainAccount(){
      if(web3.eth.accounts.length != 0){
        blockchainAccountActive = true;
        activePubKey = web3.eth.accounts[0];

        var userId = document.getElementById("userId");
        userId.innerHTML = "Current User: <font color='blue'>"+ activePubKey + "</font>";

        checkForExistingAccount(activePubKey);
        //getAccountInfo(web3.eth.accounts[0]);
      }
    }*/

    function checkForFirebaseAccount(uid){
      console.log("ENTERRED "+uid);
      var userDocRef = firestore.doc("users/"+uid);      

      userDocRef.get().then((doc) => {
        if(doc && doc.exists){
          //if the user account already exists

          //loading account data
          loadAccountData(userDocRef);
        }
        else{console.log("CREATING: "+uid);
          //if user is a new user, save the user to the firebase cloud
          userDocRef.set({
            "documents": {},
            "shared": {}
          }).then(() => {
            ////user saved to cloud

            console.log("New User Successfully added to the cloud.");
            

            //loading account data
            loadAccountData(userDocRef);

          }).catch((error) => {
            //failed to save user to the cloud. 
            console.log("Some error occurred while saving new user to cloud: "+error);
          });
        }
      });

    }

    /*function checkForExistingAccount(account){
      //checking firebase for existing account
      var userDocRef = firestore.doc("users/"+account);

      userDocRef.get().then((doc) => {
        if(doc && doc.exists){
          //if the user account already exists

          //loading account data
          loadAccountData(userDocRef);
        }
        else{
          //if user is a new user, save the user to the firebase cloud
          userDocRef.set({
            "pubKey": account,
            "documents": {},
            "shared": {}
          }).then(() => {
            ////user saved to cloud

            console.log("New User Successfully added to the cloud.");
            

            //loading account data
            loadAccountData(userDocRef);

          }).catch((error) => {
            //failed to save user to the cloud. 
            console.log("Some error occurred while saving new user to cloud: "+error);
          });
        }
      });

      
    }*/
    

/*

<div class="col-sm-6">
    <div class="card">
      <img class="card-img-top" src="..." alt="Card image cap">
      <div class="card-body">
        <h4 class="card-title">Sample Card Title</h4>
        <p class="card-text">He seems sinking under the evidence could not only grieve and a visit. The father is to bless and placed in his length hid...</p>
        <a href="#" class="btn btn-primary">Tell me more &rarr;</a>
      </div>
    </div>
  </div>

*/

    function loadAccountData(userDocRef){
      //Displaying current Account

      
      userDocRef.onSnapshot((doc) => {
        if(doc && doc.exists){

          var obj = doc.data().documents;
          var i = 0;

          //Fetching and displating current uploaded documents
          var documentList = document.getElementById("documentList");
          var str = "";

          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              //key: hash
              //val: {"ipfsHash": hash, "isSavedOnBlockchain": false}

              var val = obj[key];
              console.log(val);



              if(i%4==0){
                str = str + '<div class="example col-md-12 ml-auto mr-auto"><div class="row"><div class="col-lg-3 col-md-3 col-sm-3 mb-3">';
              }else{
                str = str + '<div class="col-lg-3 col-md-3 col-sm-3 mb-3 sm-hidden">';
              }

              var href;

              if((val.contentType == "png") || (val.contentType == "jpeg") || (val.contentType == "jpg") || (val.contentType == "gif")
                || (val.contentType == "ico") || (val.contentType == "tif") || (val.contentType == "webp") || (val.contentType == "jfif")
                || (val.contentType == "bmp") || (val.contentType == "bat") || (val.contentType == "bpg") || (val.contentType == "hfif")
                || (val.contentType == "ppm") || (val.contentType == "pgm") || (val.contentType == "pbm") || (val.contentType == "pnm")
               ){
                href = "https://gateway.ipfs.io/ipfs/"+key;
              }
              else{console.log(val.contentType);
                href = "./png/"+icons[val.contentType];
              }

              str = str + '<div class="card"><a href="https://gateway.ipfs.io/ipfs/'+
              key+'" target="_blank"><img class="card-img-top" height="165px" width="247px" src="'+href
              +'" alt="Card image cap"></a><div class="card-body">';

              if(val.name.split('.')[0].length<=16){
                str = str + '<h6>'+val.name+'</h6>';
              }
              else{
                str = str + '<h6>'+val.name.substring(0,20)+'...</h6>';
              }
              str = str + '<small>'+val.size+'</small>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+
              '<a href="#" data-toggle="modal" data-target="#pubKeyModal" onclick="share(\''+key+'\',\'documents\')"><small>Share</small></a></div></div></div>';

              if((i+1)%4 == 0){
                str = str + '</div></div>';
              }
              
              i++;
            }
          }

          
          if(str !== ""){
            document.getElementById("no_doc_msg").innerHTML = "";
            documentList.innerHTML = str;
          }
          


          var obj = doc.data().shared;
          var i = 0;

          //Fetching and displating current shared documents
          var sharedList = document.getElementById("sharedList");
          var str = "";
          var promiseArr;
          var obj = doc.data().shared;
          for (var key in obj) {


            if (obj.hasOwnProperty(key)) {
              var val = obj[key];
              console.log(val);

              if(i%6==0){
                str = str + '<div class="container"><div class="row">';
              }

              str = str + '<div class="col-md-2"><div class="cardx"><a href="https://gateway.ipfs.io/ipfs/'+key+'" target="_blank">'+
              '<img src="./png/'+icons[val.contentType]+'" alt="Avatar" height="128" width="128" ></a>'+
              '<div class="container">';
              if(val.name.split('.')[0].length<=13){
                str = str + '<small>'+val.name+'</small><br>';
              }
              else{
                str = str + '<small>'+val.name.substring(0,11)+'...</small><br>';
              }
              str = str + '<small>'+val.size+'</small>'+
              '<div class="dropdown">'+
              '<img src="https://gateway.ipfs.io/ipfs/QmeW79wewWLPakwbtaKP1ij1taz1t6WG5Ekytd3BrTEViP" align="right"  onclick="myFunction(\'dropdown_shared_'+key+'\')" class="dropbtn"/><div id="dropdown_shared_'+key+'" class="dropdown-content">'+
                //'<a href="#" onclick="submitToBlockchain(\''+key+'\',\'shared\')">Save to blockchain</a>'+
              '<a href="#" data-toggle="modal" data-target="#emailModal" onclick="setData(\''+key+'\')">Share via email</a>'+
              '<a href="#" data-toggle="modal" data-target="#pubKeyModal" onclick="setPubKey(\''+key+'\',\'shared\')">Share via publicKey</a>'+
              '</div></div>'+
              '</div></div></div>';

              if((i+1)%6 == 0){
                str = str + '</div></div><br>';
              }

              i++;
            }
          }
          if(str !== ""){
            document.getElementById("no_shared_doc_msg").innerHTML = "";
            sharedList.innerHTML = str;
          }
        }
      });

    }

    function getFileType(key){
      fetch("https://gateway.ipfs.io/ipfs/"+key, {method:"HEAD"})
      .then(response => response.headers.get("Content-Type"))
      .then(type => `${type.replace(/.+\/|;.+/g, "")}`)
      .then(result => result);
    }

    function bytesToSize(bytes) {
       var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
       if (bytes == 0) return '0 Byte';
       var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
       return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };

    var fileBuffer;
    var imageUpload = document.getElementById("customFile");
    var uploadStatus = document.getElementById("uploadStatus");
    //var caption = document.getElementById("caption");
    imageUpload.addEventListener("change", handleFiles, false);

    function handleFiles() {
      console.log("File Chosen!");
      const reader = new FileReader;
      reader.readAsArrayBuffer(imageUpload.files[0]);
      console.log("Number of files: "+ imageUpload.files.length);
      console.log(JSON.stringify(imageUpload.files));
      console.log("name: "+imageUpload.files[0].name+" size: "+imageUpload.files[0].size+ " type: "+imageUpload.files[0].type);
      console.log("Buffering...");
      reader.onload = function() {
        var arrayBuffer = reader.result;
        fileBuffer = new Uint8Array(arrayBuffer);
        console.log("Buffer: ", ipfs.Buffer.from(fileBuffer));
        ipfsUpload(imageUpload.files[0].name, bytesToSize(imageUpload.files[0].size), imageUpload.files[0].type);//bytesToSize
      }
    }

    /*function addFolder(){
      ipfs.util.addFromFs('/home/vasa/Desktop/pics/x', { recursive: true}, (err, result) => {
        if (err) { throw err }
        console.log("Added a folder: "+JSON.stringify(result))
      })
    }

    function addFromURL(){
      ipfs.util.addFromURL('https://cdn-images-1.medium.com/max/140/1*VK6eUHeFwEqWl6PdfS89dw@2x.png', (err, result) => {
      if (err) {
        throw err;
      }
        console.log("Added from URL: "+JSON.stringify(result));
      });
    }*/

    function ipfsUpload(fileName, fileSize, fileType){
      console.log("Uploading...");

      uploadStatus.innerHTML = "<img src='./gifs/cloud.gif' width='83px' height='54px'>"

      ipfs.files.add(ipfs.Buffer.from(fileBuffer), { recursive: true }, function(error, result) {
        if (error || !result) {
          console.log(error);
          uploadStatus.innerHTML = "Some Error Occured: Not able to connect to IPFS Network. Connect to other internet network and try again.";
        }
        else {
          result.forEach((file) => console.log('successfully stored', file.hash));
          //saving the hash to the firebase account
          addHashToFireBase(firebaseActiveAccount, result[0].hash, fileName, fileSize, fileType);

          console.log("IPFS Hash: ", result[0].hash);
          uploadStatus.innerHTML = "Your link: <font color='blue'><b><a href='https://gateway.ipfs.io/ipfs/"+result[0].hash+"' target='_blank'>https://gateway.ipfs.io/ipfs/"+result[0].hash+"</a></b></font>";
          //console.log("Caption: ", caption.value);
          ipfs.pin.add(result[0].hash, function (err,res){
            if(err){
              console.log(err);
            } else{
              console.log(res);
            } 
          });
          //submitToBlockchain(result[0].hash+"~"+caption.value);
        }
      });
    }


    function addHashToFireBase(pubKey, hash, fileName, fileSize, fileType){
      
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

    /*function submitToBlockchain(hash){
      web3.eth.defaultAccount = web3.eth.accounts[0];
      console.log("ACCOUNT: "+ web3.eth.defaultAccount);
      var EthGramCore = web3.eth.contract([
  {
    "constant": false,
    "inputs": [
      {
        "name": "data",
        "type": "string"
      },
      {
        "name": "separator",
        "type": "string"
      }
    ],
    "name": "AddImageData",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getUserData",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]);

              var EthGram = EthGramCore.at('0x4047b5cc5b52ce72fe158b89c9dd8a0a5ae11329');

              EthGram.AddImageData(hash, ",", function(error, result){
                  if(error){
                      console.log("Error submitting data to blockchain!!");
                  }
                  else{
                      console.log("TransactionHash: ",result);
                      setTimeout(document.location.reload(),10000);
                  }
              });
    }*/


var loadFile = function(event) {
      console.log(URL.createObjectURL(event.target.files[0]));
    };
    /*el.addEventListener('contextmenu', function(ev) {
    ev.preventDefault();
    alert('success!');
    return false;
}, false);*/
        /* When the user clicks on the button, 
    toggle between hiding and showing the dropdown content */
    function myFunction(id) {
        document.getElementById(id).classList.toggle("show");
    }

    // Close the dropdown if the user clicks outside of it
    window.onclick = function(event) {
      if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }

    
   

    function setData(key){
      document.getElementById("email_data").value = key; 

      //setting up the UI
      document.getElementById("email-body").innerHTML = '<center><div><label for="form1-email" class="col-form-label">'+
      'Email</label><input type="email" class="form-control" id="form1-email" placeholder="vasa@abc.com"><br><br>'+
      '<button type="button" class="btn btn-primary" onclick="shareViaEmail()">Send</button></div></center>';
    }

    function share(key, type){
      document.getElementById("pubKey_data").value = key;
      document.getElementById("pubKey_data").class = type;

      //setting up the UI
      document.getElementById("pubKey-body").innerHTML = '<center><div><label for="form1-email" class="col-form-label">PublicKey</label> <input type="email" class="form-control" id="form1-pubKey" placeholder="UserId or PublicKey or email"><br><br>'+
        '<p><font color="red" id="invalid_pubkey"></font></p><button type="button" class="btn btn-primary" onclick="shareDoc()">Send</button></div></center>'
    }

    /*if(web3){
      web3.currentProvider.publicConfigStore.on('update', function(){
      if(activePubKey != web3.eth.accounts[0]){
        window.location = window.location.href;
      }
      else{
       document.getElementById("userId").innerHTML = "Logged in via MetaMask."; 
      }
      //if(document.getElementById("userId").innerHTML != 'Current User: <font color="blue">'+web3.eth.accounts[0]+'</font>'){
      //document.getElementById("userId").innerHTML = 'Current User: <font color="blue">'+web3.eth.accounts[0]+'</font>';
      //document.location = document.location.href;
      //}
    });
  }*/

    function shareDoc(){
      var inputType = shareType(document.getElementById("form1-pubKey").value);

      switch(inputType){
        case "email": {
            shareViaEmail();
        };
        case "userId": {
            shareViaPubKey();
        }
      }
    }

    function shareViaPubKey(){
      

      document.getElementById("invalid_pubkey").innerHTML = "";

      var type = document.getElementById("pubKey_data").class;

      a = document.getElementById("pubKey_data").value;
      var pubKey = document.getElementById("form1-pubKey").value;
      console.log("SHARE: "+a);
      
      var firestore = firebase.firestore();
      var userDocRef = firestore.doc("users/"+pubKey);

      userDocRef.get().then((doc) => {
        if(doc && doc.exists){
          const myData = doc.data();

          var shared = myData.shared;

          console.log("shared: "+JSON.stringify(shared));

          var sharableData;
          firestore.doc("users/"+firebaseActiveAccount).get().then((doc) => {
            if(doc && doc.exists){
              var sharableData = doc.data();  
              var sharableData = sharableData.documents[a];
              console.log("sharableData: "+JSON.stringify(sharableData));

              shared[a] = sharableData;
              console.log("sharableData: "+JSON.stringify(shared));

              userDocRef.update({"shared": shared}).then(() => {
                //document shared via cloud
                console.log("Document shared successfully via cloud.");

                console.log("Updated status of database successfully.");
                document.getElementById("pubKey-body").innerHTML = "<center>Document shared successfully with "+pubKey+"<br><img src='./gifs/done.gif' height = '50%' width = '50%'/></center>";


              }).catch((error) => {
                //failed to share document via cloud. 
                console.log("Some error occurred while sharing document via cloud: "+error);
                document.getElementById("pubKey-body").innerHTML = '<center><h6>Oops... We messed up: '+error+'</h6><br><img src="./gifs/error.gif"  width="215px" height="215dip"/></center>';
              });

            }
            
          });

          
          

        }
        else{
          console.log("User doesnot exist!");
          document.getElementById("pubKey-body").innerHTML = '<center><h6>Oops... User does not exist!</h6><br><img src="./gifs/error.gif"  width="215px" height="215dip"/></center>';
        }
      });
    
    }


    function shareViaEmail(){

       var email={
            to: document.getElementById("form1-pubKey").value,
            subject: "Document shared with you!",
            body: "<p>Following documents are shared with you.</p>https://gateway.ipfs.io/ipfs/"+document.getElementById("pubKey_data").value
       };
       $.ajax({
        url: "http://18.213.209.244:3000/email",
        type: "POST",
        data: email,
        contentType: 'application/x-www-form-urlencoded',
        success: function (data) {
            console.log(data);
            document.getElementById("pubKey-body").innerHTML = "<center>Email sent successfully<br><img src='./gifs/done.gif' height = '50%' width = '50%'/></center>";
            
        },
        error: function(xhr, ajaxOptions, thrownError){
          document.getElementById("pubKey-body").innerHTML = '<center><h6>Oops... Some error occurred: '+thrownError+'</h6><br><img src="./gifs/error.gif"  width="215px" height="215dip"/></center>';
        }
    });
    }


    function shareType(input){
      if(input.includes("@")){
        return "email";
      }
      else{
        return "userId";
      }
    }

  /*function isValidPubKey(key){
    var isValid = true;

    if(key.length != 42){
      return false;
    }

    key.substring(2, a.length).split('').forEach((x)=> {
      
        if(typeof(x) != "string"){ 
          isValid = false;
          return false;
        }
        else{ 
          if((x.charCodeAt(0)<48) || ((x.charCodeAt(0)>57) && (x.charCodeAt(0)<97)) || (x.charCodeAt(0)>102)){ 
            isValid = false;
            return false;
          }
        }
      
    });

    return isValid;

  }*/