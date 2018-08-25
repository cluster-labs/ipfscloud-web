$(function() {
  $(window).load(function() {

    const IPFS = require("ipfs-api");
    const ipfs = new IPFS({ host: "ipfs.infura.io", port: 5001, protocol: "http" });

    // if (typeof web3 !== 'undefined') {
    //   // If a web3 instance is already provided by Meta Mask.
    //   web3Provider = web3.currentProvider;
    //   web3 = new Web3(web3.currentProvider);
    // } else {
    //   // Specify default instance if no web3 instance provided
    //   // App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
    //   // web3 = new Web3(App.web3Provider);
    //   console.log("Not connected to MetaMask");
    // }

    var fileBuffer;
    var imageUpload = document.getElementById("input");
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
      ipfs.files.add(Buffer.from(fileBuffer), function(error, result) {
        if (error || !result) {
          console.log(error);
        }
        else {
          console.log("IPFS Hash: ", result);
          window.location = "https://gateway.ipfs.io/ipfs/"+result[0].hash;
        }
      });
    }


  });
});
