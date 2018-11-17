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
    //Initialize Ipfs

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
    var progress_value = document.getElementById("progress-value");
    var upload_status_text = document.getElementById("upload_status_text");

    var highlighted_keys = [];

    function isUserSignedIn() {
      return !!firebase.auth().currentUser;
    }

    //USER LOGIN STATE LISTNER
    firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            // User is signed in.
            
            document.getElementById("loader").style.display = "block";
            document.getElementById("nowebsite").style.display = "none";
            document.getElementById("new_website").style.display = "none";
            document.getElementById("websites").style.display = "none";
            
            firebaseActiveAccount = user.uid;

            
              //console.log("Sign-in provider: " + profile.providerId);
              //console.log("  Provider-specific UID: " + profile.uid);
              console.log("  Name: " + user.displayName);
              console.log("  Email: " + user.email);
              console.log("  Photo URL: " + user.photoURL);
              if(user.photoURL){
                profile_pic.src = user.photoURL;
              }
            

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
            document.cookie = "userId="+firebaseActiveAccount+"; expires=Thu, 31 Dec 2130 12:00:00 UTC; path=/";

          } else {
            window.location = "login.html";
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

    $("#customFile").on("change", function(){
    	document.getElementById("file_label").innerHTML = document.getElementById("customFile").files[0].name;
    	document.getElementById("customFile").classList.remove("is-invalid");
    	document.getElementById("customFile").classList.add("is-valid");
    });

    $("#website_name").on("input", function(){
    	var name = document.getElementById("website_name").value.trim();
    	var isValid = isValidWebsiteName(name);
    	if(!isValid[0]){
    		document.getElementById("website_name").classList.remove("is-valid");
    		document.getElementById("website_name").classList.add("is-invalid");
    		document.getElementById("next").classList.remove("btn-primary");
    		document.getElementById("next").classList.add("btn-light");
    		document.getElementById("url_error").innerHTML = isValid[1];
    	}
    	else{
    		document.getElementById("url_error").innerHTML = "";
    		document.getElementById("website_name").classList.remove("is-invalid");
    		document.getElementById("website_name").classList.add("is-valid");

    		document.getElementById("next").classList.add("btn-primary");
    		document.getElementById("next").classList.remove("btn-light");

    		document.getElementById("website_url").innerHTML = "URL: &nbsp;&nbsp;<font color='#c1c3c5'>https://yoursite.host/</font><font color='blue'>"+document.getElementById("website_name").value.trim()+"</font>";
    	}
    });

    function checkForFirebaseAccount(uid){
      console.log("ENTERRED "+uid);
      var userDocRef = firestore.doc("users/"+uid);      

      userDocRef.get().then((doc) => {
        if(doc && doc.exists){
          data = doc.data();
          //if the user account already exists, Show the devices used
          showWebsites(userDocRef);
        }
        else{
          console.log("CREATING: "+uid);
          //if user is a new user, save the user to the firebase cloud

          var d = new Date();

          userDocRef.set({
            "documents": 
              {
                "QmXFnGpQmQor8kVLEJvtw1MnyHZ9xnWi3YpeTc3cWEGQPG":
                  {"ipfsHash": "QmXFnGpQmQor8kVLEJvtw1MnyHZ9xnWi3YpeTc3cWEGQPG", "contentType": "image/png", "name": "Get Started.png", "size": "57 KB", "isSavedOnBlockchain": false},
                "QmYKcdnUgFnvb9gSwauudzc4tSnqGsBn9KemzbGkVC426W":
                  {"ipfsHash": "QmYKcdnUgFnvb9gSwauudzc4tSnqGsBn9KemzbGkVC426W", "contentType": "video/mp4", "name": "How To Use.mp4", "size": "10 MB", "isSavedOnBlockchain": false}
              },
            "shared": {},
            "private": {},
            "websites": {},
            "devicesUsed": [{"device": md.ua, "datetime": d}],
            "isEncryptionKeySet": false
          }).then(() => {
            ////user saved to cloud

            console.log("New User Successfully added to the cloud.");
            showWebsites(userDocRef);
            //

          }).catch((error) => {
            //failed to save user to the cloud. 
            console.log("Some error occurred while saving new user to cloud: "+error);
          });
        }
      });

    }


    function showWebsites(userDocRef){
    	userDocRef.onSnapshot((doc) => {
    		if(doc && doc.exists){
          		data = doc.data();

          		var obj = data.websites;

          		var websites = "";

          		var j=0;

          		for (var key in obj) {
		            if (obj.hasOwnProperty(key)) {
		            	var val = obj[key];
              			console.log("val: "+val);
              		  if(j%6==0){
		                websites = websites + '<div class="row">';
		              }

		              name = "";

		              if(val.name.length<=12){
		                name = val.name;
		              }
		              else{
		                name = val.name.substring(0,10)+'...';
		              }

		              websites = websites + '<div class="col-lg-2 col-md-6 col-sm-6 mb-4 col-6 folder" >'+
		                '<div class="stats-small stats-small--1 card card-small">'+
		                '<a href="https://yoursite.host/'+val.name+'" target="_blank">'+	
		                  '<div class="card-body p-0 d-flex folder">'+
		                    '<div class="d-flex flex-column m-auto ">'+
		                      '<div class="stats-small__data text-center folder">'+
		                        '<font size="3" class="count my-3">'+
		                        '<i class="fa fa-globe" aria-hidden="true"></i>&nbsp;'+name+'</font>'+
		                      '</div>'+
		                    '</div>'+
		                  '</div></a>'+
		                '</div>'+
		              '</div>';
		              

		              if((j+1)%6 == 0){
		                websites = websites + '</div>';
		              }
		              
		              j++;
		            	}
		            }
		            document.getElementById("loader").style.display = "none";
		            document.getElementById("nowebsite").style.display = "none";
		            document.getElementById("new_website").style.display = "none";
		            document.getElementById("websites").style.display = "none";
		            if(websites.trim().length == 0){
		            	document.getElementById("nowebsite").style.display = "block";
		            }
		            else{
		            	document.getElementById("websites").style.display = "block";
		            	document.getElementById("websiteHolder").innerHTML = websites;
		            }
		            
          	}
    	});
    }


    function isValidWebsiteName(name){
    	if(name.includes("#")){
    		return[false, "# character is not allowed."];
    	}
    	else if(name.includes("/")){
    		return[false, "/ character is not allowed."];	
    	}
    	else if(name.split(".")[name.split(".").length-1] == "html"){
    		return[false, ".html is not allowed."];
    	}
    	else if(name.split(".")[name.split(".").length-1] == "htm"){
    		return[false, ".htm is not allowed."];
    	}
    	else if(name.length<2){
    		return[false, "name must be atleast 2 characters long."];
    	}
    	else{
    		return[true, ""];
    	}
    }

    var finalURL = "";

    function addWebsiteName(){
    	document.getElementById("loader").style.display = "none";
		document.getElementById("nowebsite").style.display = "none";
		document.getElementById("new_website").style.display = "block";
		document.getElementById("websites").style.display = "none";
		document.getElementById("add_website_name").style.display = "block";
		document.getElementById("upload_website").style.display = "none";
    }

    function addWebsite(){
    	var isValid = isValidWebsiteName(document.getElementById("website_name").value.trim());
    	if(isValid[0]){
    		var name = document.getElementById("website_name").value.trim().split("/")[document.getElementById("website_name").value.trim().split("/").length-1];
	    	
	    	$.ajax({
		          url: "https://yoursite.host/host?url="+name,
		          type: "GET",
		          contentType: false,
		          success: function (data) {
		          	if(!(data.result=="true")){
		          		finalURL = "https://yoursite.host/"+document.getElementById("website_name").value.trim();
			    		document.getElementById("add_website_name").style.display = "none";
			    		document.getElementById("upload_website").style.display = "block";
		          	}
		          	else{
		          		document.getElementById("website_name").classList.remove("is-valid");
		          		document.getElementById("website_name").classList.add("is-invalid");
		          		document.getElementById("url_error").innerHTML = "This url is taken. Try another URL."
		          	}
		          }
		      });
    	}
    	else{
    		document.getElementById("website_name").classList.remove("is-valid");
    		document.getElementById("website_name").classList.add("is-invalid");
    		document.getElementById("next").classList.remove("btn-primary");
    		document.getElementById("next").classList.add("btn-light");
    		document.getElementById("url_error").innerHTML = isValid[1];
    	}
    }
    function uploadWebsite(){
    	if(document.getElementById("customFile").files.length == 0){
    		document.getElementById("customFile").classList.add("is-invalid");
    	}
    	else{
    		intiateFileUpload();
    	}
    	
    }


    //UPLOADING FILE

    var count, upload_complete;

    function intiateFileUpload(){

      document.getElementById("upload_website").style.display = "none";
      document.getElementById("your_website").style.display = "block";
      document.getElementById("final_url").innerHTML = finalURL;

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
      var addFileCard = document.getElementById("customFile");
      var items = addFileCard.files[0];
      console.log(items);
      uploadFileToServer(items);

      var perSecondDelay = Math.round(((items.size/361781.125)*1000)/100);

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

    	function uploadFileToServer(file){
	      console.log("Started upload...");
	        var formData = new FormData();
	        formData.append("file", file);
	        formData.append("url", finalURL);

	        $.ajax({
	          url: "https://yoursite.host/host",
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

	              document.getElementById("add_website_name").style.display = "block";
      			  document.getElementById("your_website").style.display = "none";
      			  document.getElementById("new_website").style.display = "none";
      			  document.getElementById("final_url").innerHTML = finalURL;
	              
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

          var websites = {};
          if(myData.websites){
          	websites =  myData.websites;
          }
          console.log("WEBSITES: "+websites);
          		
          document.getElementById("website_name").value = "";
          document.getElementById("file_label").innerHTML = "Choose file...";
          document.getElementById("customFile").classList.remove("is-valid");

          		var name = finalURL.split("/")[finalURL.split("/").length-1]; 

                websites[hash] =  {"ipfsHash": hash, "isSavedOnBlockchain": false, "name": name, "size": fileSize};

                userDocRef.update({"websites": websites}).then(() => {
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

    function removeProgressBarClass1(){
      bar.classList.remove("slideInUp");
    }

    function removeProgressBarClass2(){
      bar.classList.remove("hidden");
    }

    function hideProgressBar(){
      bar.classList.add("hidden");
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