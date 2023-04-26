const nodemailer = require('nodemailer');
require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: 'mail.gmx.com',
    port: 587,
    tls: {
        ciphers:'SSLv3',
        rejectUnauthorized: false
    },
    debug:true,
    auth: {
        user: process.env.SENDER_USERNAME,
        pass: process.env.SENDER_PASSWORD
    }
});

let mailOptions = {
    from: process.env.SENDER_USERNAME,
    to: 'sedrik.staack@gmx.de',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
}); 