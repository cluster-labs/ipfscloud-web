function sendEmail(email){
    var email_body={
        to: email,
        subject: "IpfsCloud Monthly Newsletter",
        body: "You have been added to IpfsCloud Newletter group. Now you will be updated about our latest developments and features every month :)"
    };
        $.ajax({
        url: "https://api.ipfscloud.store/email",
        type: "POST",
        data: email_body,
        contentType: 'application/x-www-form-urlencoded',
        success: function (data) {
            console.log(data);
            document.getElementById('newsletter_form').classList.remove("loading");
            document.getElementsByClassName("success")[0].style = "display: flex;";
        },
        error: function(xhr, ajaxOptions, thrownError){
            console.log("email error: "+thrownError);
        document.getElementsByClassName("error")[0].innerHTML = '<center><i class="fa fa-times-circle" aria-hidden="true"></i><h6>Oops... Some error occurred while sending email. Please try Again.</h6></center>';
        }
        });
}
