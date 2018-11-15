var username = document.getElementById('username');
var email = document.getElementById('email');
var password = document.getElementById('password');
var re_password = document.getElementById('re_password');

var username_error =  document.getElementById('username_error');
var email_error =  document.getElementById('email_error');
var password_error =  document.getElementById('password_error');
var re_password_error =  document.getElementById('re_password_error');

var password_view = document.getElementById('password_view');
var re_password_view = document.getElementById('re_password_view');

var next = document.getElementById('next');

var isUserNameValid = false;
var isEmailValid = false;
var isPasswordValid = false;
var isRePasswordValid = false;

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


//CHECK IF THE USER IS LOGGED IN
firebase.auth().onAuthStateChanged(function(user) {
	if(user){
		if(username.value.trim()){
			user.updateProfile({
			  displayName: username.value.trim()
			}).then(function() {
			  // Update successful.
			  window.location = "index.html"
			}).catch(function(error) {
			  // An error happened.
			  console.log("Sme error occured while updating profile.");
			});
		}
		else{
			window.location = "index.html"
		}
	}
});



$("#username").on("input",function () {
	var result = isValidUserName(username.value.trim());
	isUserNameValid = result[0];
  if(result[0]){
  	username.classList.remove('is-invalid');
  	username.classList.add('is-valid');
  	username_error.innerHTML = "";
  }
  else{
  	username.classList.remove('is-valid');
  	username.classList.add('is-invalid');
  	username_error.innerHTML = result[1];
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


$("#password").on("input",function () {
	var result = isValidPassword(password.value.trim());
	isPasswordValid = result[0];
  if(result[0]){
  	password.classList.remove('is-invalid');
  	password.classList.add('is-valid');
  	password_error.innerHTML = "";
  }
  else{
  	password.classList.remove('is-valid');
  	password.classList.add('is-invalid');
  	password_error.innerHTML = result[1];
  }
});

$("#re_password").on("input",function () {
	var result = isValidRePassword(re_password.value.trim());
	isRePasswordValid = result[0];
  if(result[0]){
  	re_password.classList.remove('is-invalid');
  	re_password.classList.add('is-valid');
  	re_password_error.innerHTML = "";
  }
  else{
  	re_password.classList.remove('is-valid');
  	re_password.classList.add('is-invalid');
  	re_password_error.innerHTML = result[1];
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


$("#re_password_view").on("click", function(){
	switch(re_password_view.classList[1]){
		case "fa-eye": {
			re_password_view.classList.remove("fa-eye");
			re_password_view.classList.add("fa-eye-slash");
			re_password.type = "text";
			break;
		};
		case "fa-eye-slash": {
			re_password_view.classList.remove("fa-eye-slash");
			re_password_view.classList.add("fa-eye");
			re_password.type = "password";
			break;
		};
		default: {
			re_password_view.classList.remove("fa-eye");
			re_password_view.classList.add("fa-eye-slash");
			break;
		}
	}
});

$("#next").on("click", function(){
	if(areInputsValid()){
		//Sign Up user if the inputs are valid. 
		appLoading.start();
		sendVerificationEmail(email.value, password.value);
	}
});

function isValidUserName(username){
	if(username.length==0){
		return [false, "username can have minimum 1 characters"];
	}
	else if(username.length>64){
		return [false, "username can have maximum 64 characters"];
	}
	else if(!hasValidChars(username)){
		return[false, "username can contain alpha-numeric characters and .-_"];
	}
	else if(username[0]=="." || username[0]=="_" || username[0]=="-"){
		return[false, "username can only start with alpha-numeric characters"];
	}
	else{
		return[true,""];
	}
}

function hasValidChars(username){
	for(var i=0; i < username.length; i++){
		if( ((username[i].charCodeAt(0)>=48) && (username[i].charCodeAt(0)<=57)) || 
			((username[i].charCodeAt(0)>=65) && (username[i].charCodeAt(0)<=90)) ||
			((username[i].charCodeAt(0)>=97) && (username[i].charCodeAt(0)<=122)) || 
			(username[i].charCodeAt(0)== 32) || (username[i].charCodeAt(0)== 46) ||
			 (username[i].charCodeAt(0)== 45) || (username[i].charCodeAt(0)== 95) ){
		} 
		else{
			return false;
		}
	}
	return true;
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

function isValidPassword(password){
	if(password.length<8){
		return[false, "Password must contain atleast 8 characters."];
	}
	return(isAlphaNumeric(password));
}

function isValidRePassword(re_password){
	if(re_password == password.value.trim()){
		return[true, ""];
	}
	else{
		return[false, "Passwords do not match."];
	}
}

function isAlphaNumeric(str){
	var num = 0;
	var alpha = 0;
	for(var i = 0; i<str.length;i++){
		if(((str[i].charCodeAt(0)>=48) && (str[i].charCodeAt(0)<=57))){
			num++;
		}
		else if(
		((str[i].charCodeAt(0)>=65) && (str[i].charCodeAt(0)<=90)) ||
		((str[i].charCodeAt(0)>=97) && (str[i].charCodeAt(0)<=122))){
			alpha++;
		}
		else if(str[i].charCodeAt(0)==32){}
		else{
			return[false, "password should not contain special characters."];
		}
	}
	if(num==0){
		return[false, "password should contain atleast 1 number."];
	}
	if(alpha == 0){
		return[false, "password should contain atleast 1 alphabet."];
	}
	return[true, ""];
}

function areInputsValid(){
	return(isEmailValid && isUserNameValid && isPasswordValid && isRePasswordValid);
}

function sendVerificationEmail(_email, _password){
	firebase.auth().createUserWithEmailAndPassword(_email, _password).catch(function(error) {
	  // Handle Errors here.
	  	var errorCode = error.code;
	  	var errorMessage = error.message;
	  	console.log("User sign UP failed: ("+errorCode+") "+errorMessage);
	  	if(errorCode == "auth/email-already-in-use"){
	  		appLoading.stop();
	  		email.classList.remove('is-valid');
  			email.classList.add('is-invalid');
	  		email_error.innerHTML = errorMessage;
	  	}
	  
	});
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