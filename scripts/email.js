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
    }, function(err, res){
            smtpTransport.close();
            if(err){
                console.log(err);
                handle_sendemail_success(false);
            }
            else{
                console.log(res);
                handle_sendemail_success(true);
            }
    });
}

function handle_sendemail_success(results)
{
    if (results){
        //update db here
    }
    else if (!results){
        //try to email again?
    }
    
}

// send_email('iokingpoll@gmail.com', 'Test', 'testttt');