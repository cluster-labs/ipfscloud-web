/*    var blockchainAccountActive = false;
    var FirebaseAccountActive = false;

    var activePubKey;
    //check for active accounts
    checkForActiveAccounts();
    

    function checkForActiveAccounts(){
      //check for web3 account
      checkForBlockchainAccount();
      //check for Firebase account
      checkForFirebaseAccount();
    }

    function checkForBlockchainAccount(){
      if(web3.eth.accounts.length != 0){
        blockchainAccountActive = true;
        activePubKey = web3.eth.accounts[0];

        var userId = document.getElementById("userId");
        userId.innerHTML = "Current User: <font color='blue'>"+ activePubKey + "</font>";

        checkForExistingAccount(activePubKey);
        //getAccountInfo(web3.eth.accounts[0]);
      }
    }

    function checkForFirebaseAccount(){

    }

    function checkForExistingAccount(account){
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
            "documents": [],
            "shared": []
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
    
    function loadAccountData(userDocRef){
      //Displaying current Account
      

      
      userDocRef.onSnapshot((doc) => {
        if(doc && doc.exists){
          const myData = doc.data();

          //Fetching and displating current uploaded documents
          var documentList = document.getElementById("documentList");
          var str = "";

          console.log("DATA: "+myData);
          
          for(var i=0; i < myData.documents.length; i++){
            if(i%3==0){
              count = i+3;
              str = str + '<div class="example col-md-12 ml-auto mr-auto"><div class="row"><div class="col-lg-4 col-md-6 col-sm-12 mb-4">';
            }else{
              str = str + '<div class="col-lg-4 col-md-6 col-sm-12 mb-4 sm-hidden">';
            }


            str = str + '<div class="card"><a href="https://gateway.ipfs.io/ipfs/'+
            myData.documents[i].ipfsHash+'" target="_blank"><img class="card-img-top" src="https://gateway.ipfs.io/ipfs/'+
            myData.documents[i].ipfsHash+'" alt="Card image cap"></a><div class="card-body">';
            
            if(!myData.documents[i].isSavedOnBlockchain){
              str = str + '<button class="btn btn-primary" onclick="submitToBlockchain(this, "documents")" value='+myData.documents[i].ipfsHash+'>Save to Blockchain</button>';
            }
            str = str + '&nbsp;&nbsp;&nbsp;<button class="btn btn-primary" onclick="share(this)" value='+myData.documents[i].ipfsHash+'>Share</button></div></div></div>';
            if((i+1)%3 == 0){
              str = str + '</div></div>';
            }
          }
          
          documentList.innerHTML = str;


          //Fetching and displating current shared documents
          var sharedList = document.getElementById("sharedList");
          var str = "";

          console.log("DATA: "+myData);
          
          for(var i=0; i < myData.shared.length; i++){
            if(i%3==0){
              count = i+3;
              str = str + '<div class="example col-md-12 ml-auto mr-auto"><div class="row"><div class="col-lg-4 col-md-6 col-sm-12 mb-4">';
            }else{
              str = str + '<div class="col-lg-4 col-md-6 col-sm-12 mb-4 sm-hidden">';
            }


            str = str + '<div class="card"><a href="https://gateway.ipfs.io/ipfs/'+
            myData.shared[i].ipfsHash+'" target="_blank"><img class="card-img-top" src="https://gateway.ipfs.io/ipfs/'+
            myData.shared[i].ipfsHash+'" alt="Card image cap"></a><div class="card-body">';
            
            if(!myData.shared[i].isSavedOnBlockchain){
              str = str + '<button class="btn btn-primary" onclick"submitToBlockchain(this, "shared")">Save to Blockchain</button>';
            }
            str = str + '&nbsp;&nbsp;&nbsp;<button class="btn btn-primary" onclick="share(this)" value='+myData.shared[i].ipfsHash+'>Share</button></div></div></div>';
            if((i+1)%3 == 0){
              str = str + '</div></div>';
            }
          }
          
          sharedList.innerHTML = str;
        }
      });

    }


    

    var fileBuffer;
    var imageUpload = document.getElementById("customFile");
    var uploadStatus = document.getElementById("uploadStatus");
    //var caption = document.getElementById("caption");
    imageUpload.addEventListener("change", handleFiles, false);

    function handleFiles() {
      console.log("File Chosen!");
      const reader = new FileReader;
      reader.readAsArrayBuffer(imageUpload.files[0]);
      console.log("Buffering...")
      reader.onload = function() {
        var arrayBuffer = reader.result;
        fileBuffer = new Uint8Array(arrayBuffer);
        console.log("Buffer: ", fileBuffer);
        ipfsUpload();
      }
    }

    function ipfsUpload() {
      console.log("Uploading...");

      uploadStatus.innerHTML = "<img src='https://gateway.ipfs.io/ipfs/QmeFV59t8NDdeXQFpkwWqqGZvnFiXkxqD2dnkjRpC52ftv' width='10%' height='10%'>"

      ipfs.files.add(Buffer.from(fileBuffer), function(error, result) {
        if (error || !result) {
          console.log(error);
          uploadStatus.innerHTML = "Some Error Occured: Not able to connect to IPFS Network. Connect to other internet network and try again.";
        }
        else {
          result.forEach((file) => console.log('successfully stored', file.hash))
          //saving the hash to the firebase account
          addHashToFireBase(activePubKey, result[0].hash);


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


    function addHashToFireBase(pubKey, hash){
      /*const userDocRef = firestore.doc("users/"+pubKey);

      const newDoc = [{"ipfsHash": hash, "isSavedOnBlockchain": false}]; // whatever the uid is...

      return firestore.runTransaction((t) => {
        return t.get(userDocRef).then((doc) => {
          // doc doesn't exist; can't update
          if (!doc.exists) return;
          // update the users array after getting it from Firestore.
          const newDocArray = doc.get('documents').push(newDoc);
          t.set(userDocRef, { documents: newDocArray }, { merge: true });
        });
      }).catch(console.log);*/



      var userDocRef = firestore.doc("users/"+pubKey);
      userDocRef.get().then((doc) => {
        if(doc && doc.exists){
          var myData = doc.data();
          var documents = myData.documents;
          console.log("DOCUEMNTS: "+documents);
          documents.push({"ipfsHash": hash, "isSavedOnBlockchain": false});

          userDocRef.update({"documents": documents}).then(() => {
            console.log("New document successfully added to the cloud.");
          }).catch((error) => {
            console.log("Some error occured while adding new document to the cloud: "+error);
          });

        }
      })
      
    }

    function submitToBlockchain(hash){
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