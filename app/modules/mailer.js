const nodemailer = require("nodemailer");
const path = require('path');
const ejs = require("ejs");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAILUSER, // generated ethereal user
        pass: process.env.EMAILPASSWORD, // generated ethereal password
    },
});

const sendEmail = (info, callback) => {
    const d = new Date();
    // setup email data with unicode symbols
    ejs.renderFile(path.join(__dirname, '..','views/EmailVerify.ejs'), {info}, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            const mailOptions = {
                from: process.env.EMAILUSER,
                to: info.email,
                subject: "Proko Park: Please verify your account",
                html: data,
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                    callback({
                        status: false,
                        message: "EMAIL SEND FAIL",
                    });
                } else {
                    // console.log('Email sent: ' + info.response);
                    callback({
                        status: true,
                        message: "EMAIL SENT",
                    });
                }
            });
        }

    });
};

module.exports = {sendEmail};