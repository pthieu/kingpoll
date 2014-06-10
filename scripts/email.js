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
    send_email_confirmation: function (email, u_id, v_id, v_valid){
        if(process.env.NODE_ENV == 'production'){
            var host = 'www.kingpoll.com';
        }
        else{
            var host = 'localhost:8888';
        }
        User.findOne({'u_email':email}, function (err, user) {
            url = 'http://'+host+'/verify/v?g='+v_valid+'&u='+email+'&v='+v_id; // use below line for production
            // url = 'http://www.kingpoll.com/verify/v/'+v_valid+'+'+u_id+'+'+v_id;
            //Logic to determine poll information from poll_id, and the confirmation URL
            subject = 'KingPoll: Validate your vote now!';
            body = "Hi!\n\nYour votes are currently pending validation! We have generated a validation link for you. "
            + "Please click on the following link to verify you\'re not a robot and validate your votes:\n    " + url
            + "\n\nYou will receive a validation link every 10 votes. "
            + "Any votes not validated will be deleted after 24 hours. "
            + "\n\nIf you don't want to receive validation e-mails, please sign up!";
            send_email(email, subject, body);
        });
    },

    send_user_confirmation: function (email, u_id, v_valid){
        if(process.env.NODE_ENV == 'production'){
            var host = 'www.kingpoll.com';
        }
        else{
            var host = 'localhost:8888';
        }
        User.findOne({'u_email':email}, function (err, user) {
            url = 'http://'+host+'/verifyuser/v?g='+v_valid+'&u='+email; // use below line for production
            // url = 'http://www.kingpoll.com/verify/v/'+v_valid+'+'+u_id+'+'+v_id;
            //Logic to determine poll information from poll_id, and the confirmation URL
            subject = 'KingPoll: Validate your user account now!';
            body = "Hi!\n\nYour user account is currently pending validation! We have generated a validation link for you. "
            + "Please click on the following link to verify you\'re not a robot and validate your votes:\n    " + url
            + "\n\nThank you for signing up and verifying your new account";
            send_email(email, subject, body);
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
                //if failed, try again?
                handle_sendemail_success(false);
            }
            else{
                console.log(res);
                //if pass, we set an expirey date on vote. or? query all votes that are v_valid != true that are before a specific date
                //reset all polls affected
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