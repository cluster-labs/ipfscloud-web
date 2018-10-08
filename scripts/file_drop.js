var files = document.getElementById("files");
var folders = document.getElementById("folders");


files.addEventListener("dragover", change_files, false);
files.addEventListener("dragleave",change_back_files, false);
files.addEventListener("drop", function(event){
	files.style = '';
	event.preventDefault();
	var items = event.dataTransfer.files;
    console.log(items[0]);
    uploadToServer(items[0]);
}, false);


folders.addEventListener("dragover", change_folders, false);
folders.addEventListener("dragleave",change_back_folders, false);
folders.addEventListener("drop", function(event){
	folders.style = '';
	event.preventDefault();
}, false);


function change_files() {
  event.preventDefault();
  files.style = 'background-color: #C1E1DE; border: 3px solid blue; width: 100%; height:100%;';
};

function change_back_files() {
  files.style = '';
};

function change_folders() {
  event.preventDefault();
  folders.style = 'background-color: #C1E1DE; border: 3px solid blue; width: 100%; height:100%;';
};

function change_back_folders() {
  folders.style = '';
};

function uploadToServer(file){
	console.log("Started upload...");
    var formData = new FormData();
    formData.append("profile-pic", file);
        
    $.ajax({
      url: "http://api.ipfscloud.store/upload/file",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
          console.log(data);
      },
      error: function(xhr, ajaxOptions, thrownError){
        console.log("error: "+thrownError);
      }
  });
  }

/*function uploadFiles(event){
	files.style = '';
	var items = event.dataTransfer.files;
    console.log(items[0]);
}
*/
/*files.ondrop = function(e) {
  console.log("vasa");
  var length = e.dataTransfer.items.length;
  for (var i = 0; i < length; i++) {
    var entry = e.dataTransfer.items[i].webkitGetAsEntry();
    if (entry.isFile) {
      console.log("i: "+i +" kind: "+entry.kind);
    } else if (entry.isDirectory) {
      console.log("i: "+i +" kind: "+entry.kind);
    }
  }
};

folders.ondrop = function(e) {
	console.log("vasa");
  var length = e.dataTransfer.items.length;
  for (var i = 0; i < length; i++) {
    var entry = e.dataTransfer.items[i].webkitGetAsEntry();
    if (entry.isFile) {
      console.log("i: "+i +" kind: "+entry.kind);
    } else if (entry.isDirectory) {
      console.log("i: "+i +" kind: "+entry.kind);
    }
  }
};*/



/*function folderDropHandler(ev) {
  folders.style = '';
  console.log('File(s) dropped');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        console.log('... file[' + i + '].name = ' + file.name);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
  } 
  
  // Pass event to removeDragData for cleanup
  removeDragData(ev)
}*/
