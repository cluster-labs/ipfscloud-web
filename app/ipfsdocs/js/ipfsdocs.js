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

//starting page loader
appLoading.start();

//USER LOGIN STATE LISTNER
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    getUserDocs(user.uid);
  }
  else{
    window.location = "https://ipfscloud.store/app/login.html?redirect="+window.location.href;
  }
});

function getUserDocs(uid){
  

  $.ajax({
    url: "https://api.ipfscloud.store/docs/"+uid,
    type: "GET",
    success: function (data) {

      console.log(data);
      var list = "";
      var i, lastEdited, date;
      for(i=0; i<data.docs.length; i++){
        if(i%6==0){
          list = list + '<div class="container"><div class="row">';
        }

        date = data.docs[i].lastEditedAt.split('T')[0].split('-');
        lastEdited = date[2]+" "+getMonth(date[1])+"'"+date[0].substring(2,4);

        list = list +
        '<div class="col-6 col-sm-6 col-md-4 col-lg-2 col-xl-2">'+
            '<div onclick="openDoc(\''+data.docs[i].roomId+'\')" class="card clickable">'+
            '<div class="card-body"><h6>'+
            data.docs[i].docName+'<br>'+
            '<small>edited '+lastEdited+'</small><br>'+
                    '</h6></div>'+
                '</div>'+
        '</div>';

        if((i+1)%6==0){
          list = list + '</div></div>';
        }
      }
      if((i+1)%6!=0){
        list = list + '</div></div>';
      }
      if(list=="</div></div>"){
        list = '<h6><font color="#c3c7cc">No Documents Here</font></h6>';
      }
      //stopping page loader
      appLoading.stop();

      console.log(list);
      document.getElementById("userDocList").innerHTML = list;
    },
    error: function(xhr, ajaxOptions, thrownError){
      //stopping page loader
      appLoading.stop();
      console.log("error: "+thrownError);
    }
  });
}

function openDoc(docId){
  window.open("https://ipfscloud.store/app/ipfsdocs/doc.html?roomId="+docId+"&type=0&access=w");
}


function getMonth(index){
  switch(index){
    case "01": {return "Jan";break;};
    case "02": {return "Feb";break;};
    case "03": {return "Mar";break;};
    case "04": {return "Apr";break;};
    case "05": {return "May";break;};
    case "06": {return "Jun";break;};
    case "07": {return "Jul";break;};
    case "08": {return "Aug";break;};
    case "09": {return "Sep";break;};
    case "10": {return "Oct";break;};
    case "11": {return "Nov";break;};
    case "12": {return "Dec";break;};
  }
}

//Start a new document

$("#newDoc").on("click", function(){
    appLoading.start();

    var formData = {
      "uid": firebase.auth().currentUser.uid,
      "type": "0"
    };

    $.ajax({
        url: "https://api.ipfscloud.store/doc",
        type: "POST",
        data: JSON.stringify(formData),
        processData: false,
        contentType: "application/json",
        success: function (data) {
          appLoading.stop();
          window.location = "https:///ipfscloud.store/app/ipfsdocs/doc.html?roomId="+data.docId+"&type=0&access=w"
        },
        error: function(xhr, ajaxOptions, thrownError){
          appLoading.stop();
          console.log("error: "+thrownError);
        }
      });
});