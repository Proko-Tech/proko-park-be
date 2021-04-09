const rateLimit = require('express-rate-limit');

const appLimiter = rateLimit({
    windowMs: 1000,
    max: 3,
    message: 'Too many request was made from this IP address, please try again later',
});

const signUpLimiter = rateLimit({
    windowMs: 60*60*1000, // 1 hour window
    max: 5,
    message: 'Too many accounts created from this IP, please try again after an hour',
});

module.exports={appLimiter, signUpLimiter};
