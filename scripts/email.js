var nodemailer = require("nodemailer");

var smtpTransport =  nodemailer.createTransport("SMTP",{
     service: "Gmail",
     auth: {
                user: "iokingpoll@gmail.com",
                pass: "Poopoo123"
     }
});

module.exports = {

    send_email_confirmation: function (email, post_id){
    url = 'http://www.google.com';

    //Logic to determine post information from post_id, and the confirmation URL
    
    subject = 'KingPoll: Confirm your vote now!';
    body = 'Please click on the following link to confirm your vote on KingPoll:\n\n' + url

    send_email(email, subject, body);

    }
};

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
//send_email_confirmation('mark.sk.ho@gmail.com', 1);
