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
    from: process.env.EMAILUSER,
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

const sendReservationConfirmation = (lot, vehicle, card, receiverEmail, firstName, callback) => {
    const d = new Date();
    // setup email data with unicode symbols
    ejs.renderFile(path.join(__dirname, '..','views/ReservationConfirmation.ejs'), {lot, vehicle, card, firstName}, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            const mailOptions = {
                from: process.env.EMAILUSER,
                to: receiverEmail,
                subject: "Proko Park: Reservation Confirmation",
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

const sendReceipt = (lot, vehicle, card, receiverEmail, first_name, amount, time, callback) => {
    const d = new Date();
    // setup email data with unicode symbols
    ejs.renderFile(path.join(__dirname, '..','views/Receipt.ejs'), {lot, vehicle, card, first_name, amount, time}, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            const mailOptions = {
                from: process.env.EMAILUSER,
                to: receiverEmail,
                subject: "Proko Park: Receipt for a recent parking session",
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

const sendCoownVehicleInvitation = (user, inviter, vehicle) => {
    const d = new Date();
    // setup email data with unicode symbols
    ejs.renderFile(path.join(__dirname, '..','views/CoownVehicleInvite.ejs'), {user, inviter, vehicle}, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            const mailOptions = {
                from: process.env.EMAILUSER,
                to: user.email,
                subject: "Proko Park: You are invited to co-own a vehicle",
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

module.exports = {sendEmail, sendReservationConfirmation, sendReceipt, sendCoownVehicleInvitation};
