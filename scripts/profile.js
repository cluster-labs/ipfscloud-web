var profile_pic = document.getElementById('profile_pic');
var username = document.getElementById('username');
var email = document.getElementById('email');
var bar = document.getElementById("upload_status");
var progress_bar = document.getElementById("upload_progress");
var progress_value = document.getElementById("progress-value");
var upload_status_text = document.getElementById("upload_status_text");
var shareable_link_popup = document.getElementById("shareable_link_popup");

appLoading.start();

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

//USER LOGIN STATE LISTNER
    firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
          	user.providerData.forEach(function (profile) {
          		if(profile.photoURL){
          			profile_pic.src = profile.photoURL;
          		}
          		else{
          			profile_pic.src = "https://gateway.ipfs.io/ipfs/QmbbnkCgDGsQzhk1DWbczMSAHgAxCYNTdikGhmoN262Xpg";
          		}
          		if(profile.displayName){
          			username.value = profile.displayName;
          		}
          		else{
          			username.placeholder = "username";
          		}
				if(profile.email){
					email.value = profile.email;
				}
				else{
					email.placeholder = "Email";
				}
				appLoading.stop();
		    });
          }
          else{
          	window.location = "login.html";
          }
   	});



function changeProfilePic(){
	var count = 0;
   	var upload_complete = false;
    
      
    upload_status_text.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Uploading...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    progress_bar.classList.remove("bg-success");


    removeProgressBarClass1();
    removeProgressBarClass2();
    bar.classList.add("slideInUp");

	var addFileCard = document.getElementById("addFileCard");
    var file = addFileCard.files[0];

	var formData = new FormData();
     	formData.append("profile-pic", file);
            
     	$.ajax({
       	url: "http://api.ipfscloud.store/file",
      	type: "POST",
       	data: formData,
       	processData: false,
       	contentType: false,
       	success: function (data) {
       			profile_pic.src = "https://gateway.ipfs.io/ipfs/"+data.hash;

       			progress_bar.style = "width: 100%";
              	progress_value.innerHTML = 100;
              	upload_status_text.innerHTML = "Upload Complete";
              	progress_bar.classList.add("bg-success");

       			setTimeout(hideProgressBar,2000);
       		}
    	});


      var perSecondDelay = Math.round(((file.size/11212.6466)*1000)/100);

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


$("#update").on("click", function(){

	appLoading.start();

	email.classList.remove('is-invalid');
  	email.classList.add('is-valid');
  	email_error.innerHTML = "";
  	
	username.classList.remove('is-invalid');
  	username.classList.add('is-valid');
  	username_error.innerHTML = "";

	var user = firebase.auth().currentUser;
	user.providerData.forEach(function (profile) {

		//if profile_pic or/and username is changed

		if((profile_pic.src != profile.photoURL) || (username.value != profile_pic.displayName)){
			user.updateProfile({
			displayName: username.value.trim(),
			photoURL: profile_pic.src
				}).then(function() {

					appLoading.stop();

					//show the popup
					shareable_link_popup.classList.remove("slideInUp");
      				shareable_link_popup.classList.remove("hidden");
      				shareable_link_popup.classList.add("slideInUp");

      				setTimeout(linkCopiedPopup,3000);
					
				}).catch(function(error) {
					appLoading.stop();
					console.log("Some error occured while updating your profile: "+error);
				});
		}

		//if email is added for first time
		if(email.value.trim() != profile.email){

			user.updateEmail(email.value.trim()).then(function() {
			  
			  appLoading.stop();

			  //show the popup
				shareable_link_popup.classList.remove("slideInUp");
      			shareable_link_popup.classList.remove("hidden");
      			shareable_link_popup.classList.add("slideInUp");

      			setTimeout(linkCopiedPopup,3000);

			}).catch(function(error) {
				appLoading.stop();

			  	console.log("Some error occured while updating your profile: "+error);

			  	email.classList.remove('is-valid');
  				email.classList.add('is-invalid');
			  	email_error.innerHTML = error;
			});
		}


		//if email is changed

		
	});
});


function removeProgressBarClass1(){
    bar.classList.remove("slideInUp");
}

function removeProgressBarClass2(){
    bar.classList.remove("hidden");
}
function hideProgressBar(){
    bar.classList.add("hidden");
}

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

function linkCopiedPopup(){
    shareable_link_popup.classList.add("hidden");
}