const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const path = require('path');
const ejs = require('ejs');
require('dotenv').config();

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL,
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
});

const transporter = nodemailer.createTransport(
    {
        host: 'smtp.gmail.com',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAILUSER,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: oauth2Client.getAccessToken(),
        },
        secure: true,
    },
    {
        from: process.env.EMAILUSER,
    },
);

const sendEmail = (info, callback) => {
    const d = new Date();
    // setup email data with unicode symbols
    ejs.renderFile(
        path.join(__dirname, '..', 'views/EmailVerify.ejs'),
        {info},
        function(err, data) {
            if (err) {
                console.log(err);
            } else {
                const mailOptions = {
                    from: process.env.EMAILUSER,
                    to: info.email,
                    subject: 'Proko Park: Please verify your account',
                    html: data,
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                        callback({
                            status: false,
                            message: 'EMAIL SEND FAIL',
                        });
                    } else {
                        // console.log('Email sent: ' + info.response);
                        callback({
                            status: true,
                            message: 'EMAIL SENT',
                        });
                    }
                });
            }
        },
    );
};

const sendReservationConfirmation = (
    lot,
    vehicle,
    card,
    receiverEmail,
    firstName,
    callback,
) => {
    const d = new Date();
    // setup email data with unicode symbols
    ejs.renderFile(
        path.join(__dirname, '..', 'views/ReservationConfirmation.ejs'),
        {lot, vehicle, card, firstName},
        function(err, data) {
            if (err) {
                console.log(err);
            } else {
                const mailOptions = {
                    from: process.env.EMAILUSER,
                    to: receiverEmail,
                    subject: 'Proko Park: Reservation Confirmation',
                    html: data,
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                        callback({
                            status: false,
                            message: 'EMAIL SEND FAIL',
                        });
                    } else {
                        // console.log('Email sent: ' + info.response);
                        callback({
                            status: true,
                            message: 'EMAIL SENT',
                        });
                    }
                });
            }
        },
    );
};

const sendReceipt = (
    lot,
    vehicle,
    card,
    receiverEmail,
    first_name,
    amount,
    time,
    callback,
) => {
    const d = new Date();
    // setup email data with unicode symbols
    ejs.renderFile(
        path.join(__dirname, '..', 'views/Receipt.ejs'),
        {lot, vehicle, card, first_name, amount, time},
        function(err, data) {
            if (err) {
                console.log(err);
            } else {
                const mailOptions = {
                    from: process.env.EMAILUSER,
                    to: receiverEmail,
                    subject: 'Proko Park: Receipt for a recent parking session',
                    html: data,
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                        callback({
                            status: false,
                            message: 'EMAIL SEND FAIL',
                        });
                    } else {
                        // console.log('Email sent: ' + info.response);
                        callback({
                            status: true,
                            message: 'EMAIL SENT',
                        });
                    }
                });
            }
        },
    );
};

const sendCoownVehicleInvitation = (user, inviter, vehicle, callback) => {
    const d = new Date();
    // setup email data with unicode symbols
    ejs.renderFile(
        path.join(__dirname, '..', 'views/CoownVehicleInvite.ejs'),
        {user, inviter, vehicle},
        function(err, data) {
            if (err) {
                console.log(err);
            } else {
                const mailOptions = {
                    from: process.env.EMAILUSER,
                    to: inviter.email,
                    subject: 'Proko Park: You are invited to co-own a vehicle',
                    html: data,
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                        callback({
                            status: false,
                            message: 'EMAIL SEND FAIL',
                        });
                    } else {
                        // console.log('Email sent: ' + info.response);
                        callback({
                            status: true,
                            message: 'EMAIL SENT',
                        });
                    }
                });
            }
        },
    );
};

const sendAvailabilityNotification = (
    receiver_emails,
    lot_name,
    callback,
) => {
    ejs.renderFile(
        path.join(__dirname, '..', 'views/AvailabilityNotification.ejs'),
        {lot_name},
        function(err, data) {
            if (err) {
                console.log(err);
            } else {
                const mailOptions = {
                    from: process.env.EMAILUSER,
                    to: process.env.EmailUser,
                    bcc: receiver_emails,
                    subject: 'Proko Park: Availability Notification',
                    html: data,
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                        callback({
                            status: false,
                            message: 'EMAIL SEND FAIL',
                        });
                    } else {
                        // console.log('Email sent: ' + info.response);
                        callback({
                            status: true,
                            message: 'EMAIL SENT',
                        });
                    }
                });
            }
        },
    )
}

module.exports = {
    sendEmail,
    sendReservationConfirmation,
    sendReceipt,
    sendCoownVehicleInvitation,
    sendAvailabilityNotification,
};
