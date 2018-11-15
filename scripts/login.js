var email = document.getElementById('email');
var password = document.getElementById('password');
var password_error =  document.getElementById('password_error');
var shareable_link_popup = document.getElementById("shareable_link_popup");

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



    firebase.initializeApp(production_config);
  var firestore = firebase.firestore();
  const settings = {timestampsInSnapshots: true}
  firestore.settings(settings);


firebase.auth().onAuthStateChanged(function(user) {
  if(user){
    appLoading.start();
    window.location = "index.html"
  }
});



$("#next").on("click", function(){
  
  appLoading.start();
  password.classList.remove('is-invalid');
  password_error.innerHTML = "";

  firebase.auth().signInWithEmailAndPassword(email.value.trim(), password.value.trim()).catch(function(error) {
    // Handle Errors here.
    
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("User Email-Password Sign up failed: ("+errorCode+") "+errorMessage);
    if(errorCode == "auth/wrong-password"){
      appLoading.stop();
      password.classList.add('is-invalid');
      password_error.innerHTML = errorMessage;
    }
    else if(errorCode == "auth/user-not-found"){
      appLoading.stop();
      password.classList.add('is-invalid');
      password_error.innerHTML = errorMessage;
    }
  });
});


$("#anonymousSignInWrapper").on("click", function(){

  appLoading.start();

  firebase.auth().signInAnonymously().catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("User anonymous Sign up failed: ("+errorCode+") "+errorMessage);
  });
});

function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}

$("#gSignInWrapper").on("click", function(){

  appLoading.start();

  if(!isUserSignedIn()){
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/appstate');

    firebase.auth().useDeviceLanguage();
      provider.setCustomParameters({
        'login_hint': 'user@example.com'
      });

      firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        
        console.log("User Google Sign up failed: ("+errorCode+") "+errorMessage);

        appLoading.stop();
      });
  }

});

$("#email").on("input",function () {
  var result = isValidEmail(email.value.trim());
  isEmailValid = result[0];
  if(result[0]){
    email.classList.remove('is-invalid');
    email.classList.add('is-valid');
    email_error.innerHTML = "";
  }
  else{
    email.classList.remove('is-valid');
    email.classList.add('is-invalid');
    email_error.innerHTML = result[1];
  }
});

$("#password_view").on("click", function(){
  switch(password_view.classList[1]){
    case "fa-eye": {
      password_view.classList.remove("fa-eye");
      password_view.classList.add("fa-eye-slash");
      password.type = "text";
      break;
    };
    case "fa-eye-slash": {
      password_view.classList.remove("fa-eye-slash");
      password_view.classList.add("fa-eye");
      password.type = "password";
      break;
    };
    default: {
      password_view.classList.remove("fa-eye");
      password_view.classList.add("fa-eye-slash");
      break;
    }
  }
});

$('#forgot_password').on("click", function(){
  var isValid = isValidEmail(email.value.trim());
  if(isValid[0]){
    firebase.auth().sendPasswordResetEmail(email.value.trim()).then(function() {
      // Email sent.
      //show the popup
      shareable_link_popup.classList.remove("slideInUp");
      shareable_link_popup.classList.remove("hidden");
      shareable_link_popup.classList.add("slideInUp");

      setTimeout(mailSentPopup,3000);

    }).catch(function(error) {
      // An error happened.
    });
  }
  else{
    email.classList.remove('is-valid');
    email.classList.add('is-invalid');
    email_error.innerHTML = isValid[1];
  }
  
});


function mailSentPopup(){
    shareable_link_popup.classList.add("hidden");
}

function isValidEmail(email){
  var mailformat=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if(email.match(mailformat)){
    return[true, ""];
  }
  else{
    return[false, "Email address not valid."];
  }
}

function openPage(item){
  switch(item){
    case 'termsofuse':{
      window.open("termsofuse.html");
      break;
    };
    case 'faq':{
      window.open("faq.html");
      break;
    };
    case 'privacy':{
      window.open("privacy.html");
      break;
    };
  }
}