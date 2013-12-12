var mongoose = require('mongoose');
var User = mongoose.model('user');
var nodemailer = require("nodemailer");
var help = require('./help.js');
var shortid = require('shortid');

var smtpTransport =  nodemailer.createTransport("SMTP",{
     service: "Gmail",
     auth: {
                user: "iokingpoll@gmail.com",
                pass: "Poopoo123"
     }
});

module.exports = {
    send_email_confirmation: function (email, p_id, v_id){
        User.findOne({'u_email':email}, function (err, user) {
            var new_salt = shortid.generate();
            user.u_salt.push(new_salt);
            user.save(function (err) {
                if (err) console.error(err);
                url = 'http://www.kingpoll.com/verify/'+email+'-'+p_id+'-'+v_id;
                //Logic to determine poll information from poll_id, and the confirmation URL
                subject = 'KingPoll: Validate your vote now!';
                body = 'Hi!\n\nYour votes are currently pending validity! Please click on the following link to verify you\'re not a robot and validate your last 10 votes:\n' + url
                + "\n\nIf you don't verify yourself, your vote will be deleted after 24 hours. If you don't want to receive validation e-mails, please sign up!";
                send_email(email, subject, body);
            });

        });
    }
}

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