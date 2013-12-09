var nodemailer = require("nodemailer");

var smtpTransport =  nodemailer.createTransport("SMTP",{
   service: "Gmail",
   auth: {
        user: "iokingpoll@gmail.com",
        pass: "Poopoo123"
   }
});

function send_email(email, subject, msg){
    smtpTransport.sendMail({
        from: "KingPoll <iokingpoll@gmail.com>",
        to: email,
        subject: subject,
        text: msg
    }, function(error,response){
        if(error){
	    console.log(error);
        }else{
	    console.log(response);
	}
	smtpTransport.close();
    });
    
}

//send_email('iokingpoll@gmail.com', 'Test', 'testttt');
