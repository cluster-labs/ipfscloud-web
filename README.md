# [IpfsCloud](https://ipfscloud.store)
IpfsCloud: A Decentralized, Anonymous Cloud Storage Platform on IPFS. A project under **[ClusterLabs](https://clusterlabs.io)**.

## Using IpfsCloud Locally.

* Clone the repository: `git clone https://github.com/vasa-develop/ipfscloud.git`

* For getting the latest development code: `git pull origin development; git checkout development`  
For getting the latest stable code: `git pull origin production; git checkout production`
  
* Add the ipfscloud root folder to your webserver root folder.  
  For eg. In Linux, apache webserver: `/var/www/html/`  
  Add the folder: `/var/www/html/ipfscloud`
  
* Open the application in browser: http://localhost/ipfscloud

# IpfsCloud Upload Button Widget

Using this you can **embed IpfsCloud button to your site**. 
A user can click the widget, which will prompt the user to add a file to be uploaded. After choosing the file the upload will start and an on completion of the upload, an event will be fired which can be used to:
* check the status of the upload("success" or "failed")
* retrieve data related to the upload(file "hash" and "size")

## How to use?
Here is a sample code to get started:
```
<!--CSS CDN link for IpfsCloud widget-->
<link href="https://cdn.jsdelivr.net/gh/vasa-develop/ipfscloud@f157536445863f27481d8ce5e3025f25264d1113/app/docs/v1/css/ipfscloud-uploader.min.css" rel="stylesheet">

<!--body-tag-starts-->
    <center>
        <!--this div element will form the button-->
        <div id="IpfsCloudUploader"></div>
    </center>
<!--body-tag-ends-->

<!--JQuery needed for functioning of the widget-->
<script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>

<!--JS CDN link for IpfsCloud widget-->
<script src="https://cdn.jsdelivr.net/gh/vasa-develop/ipfscloud@bd23078768a5c708fc0f322a3e0e0cfb45b61f71/app/docs/v1/js/ipfscloud-uploader.min.js" ></script>
```

The above sample will display a button wherever you place the ```div``` tag with id ```IpfsCloudUploader```. 

Events are fired through the global element ```ipfscloud```.

```
<script>
ipfscloud.addEventListener("icevent", function(event) {
    console.log(event.detail);
  });
</script>
```

The event "icevent" outputs the following when upload is completed or an error is encountered while uploading:
- In case of successful upload:
```
{
    "status" : "success",
    "data": {
        "hash": "hash of the uploaded file",
        "path": "path of the uploaded file",
        "size": size of the file in bytes
    },
    "error": null
}
```
- In case of error encountered while uploading a file:
```
{
    "status" : "failed",
    "data": null,
    "error": "some error"
}
```
**NOTE that the UI is handled automatically after a successful upload or a failure.**

## Apps made using IpfsCloud
* **[IpfsHost](https://ipfscloud.store/app/host.html)**: Host your website in a minute for free(paid version with new features will be released soon).  You can host websites/webapps (not server-side code) on IpfsHost. You can host in 2 simple steps: 
  *  **Choose a name for your website/webapp**: Visit  [IpfsHost](https://ipfscloud.store/app/host.html) and click "Host a Website" and typein a name of your choice(let's say "mywebapp.com"). Your website/webapp will be hosted at: https://yoursite.host/mywebapp.com.
  *  **Upload website zipped code**: After selecting a name, you will have to upload ZIPPED file(**[here](https://gateway.ipfs.io/ipfs/QmSL7A7HpP1XdSN6K92JDq9RRGNiVU1fPYVzGqTT4n6grd)** is an example ZIP file for reference). After uploading website code, click "Upload your website" and in few seconds to a minute(depending on your file size) your website will be live :) **P.S. If you don't have website code, then you can use our free [website builder](https://ipfscloud.store/app/build)**. 
  *You can **report a bug or suggest a feature** [here](https://github.com/vasa-develop/ipfscloud/issues/new).*
   
* **[IpfsDocs](https://ipfscloud.store/app/ipfsdocs)**: IpfsDocs is an decentralized alternative to Google Docs and Microsoft Word. You can:
  * Create documents
  * Edit documents
  * Share editable links for collaborative editing.
  * Share read-only links for read-only purposes.
  *You can **report a bug or suggest a feature** [here](https://github.com/vasa-develop/ipfscloud/issues/new).*

## Demos Videos of all Apps
* **[How to use IpfsCloud: A Decentralized, Anonymous Unlimited Storage Service
](https://www.youtube.com/watch?v=haTNz17Se9E)**
* **[Mirroring 3d objects using IPFS pubsub](https://www.youtube.com/watch?v=edU4cwZ5u-A)**
* **[IpfsHost: BUILD and HOST Website for FREE in 30 SECONDS](https://www.youtube.com/watch?v=rzKJmUn3IO0)**
* **[IpfsDocs: A document management and Collaboration app on Ipfs](https://www.youtube.com/watch?v=e3VLAd1BrFs)**


## Contributing

* Follow the Guidelines from [Contribution.md](https://github.com/vasa-develop/ipfscloud/blob/master/Contribution.md) to contribute. We love and support contributors and PRs :)

## Reporting a Bug, Issues or Suggesting Features

* You can report Bugs, Issues and suggest features **[here](https://github.com/vasa-develop/ipfscloud/issues/new)**. 
