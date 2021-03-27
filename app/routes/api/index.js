const express = require('express');
const router = express.Router();
const limiter = require('../../middlewares/rate_limiters/config');
const verifyParkingLotToken = require('../../middlewares/parking_lot/verifyParkingLotToken');
const verifyUserToken = require('../../middlewares/users/verifyUserToken');

// api folders
const parkingLotRouter = require('./parking_lot');
const parkingLotAuthenticateRouter = require('./parking_lot_authenticate');

const userRoute = require('./users');
const userAuthenticateRoute = require('./user_authenticate');
const parkingLotsRouter = require('./parking_lots');
const reserveRouter = require('./reserve');
const signupRouter = require('./signup');
const historiesRouter = require('./histories');

// routes
router.use('/parking_lot', verifyParkingLotToken, parkingLotRouter);
router.use('/parking_lot_authenticate', parkingLotAuthenticateRouter);

// user routes:
router.use('/user', verifyUserToken, userRoute);
router.use('/user_authenticate', userAuthenticateRoute);
router.use('/parking_lots', verifyUserToken, parkingLotsRouter);
router.use('/reserve', verifyUserToken, reserveRouter);
router.use('/histories', verifyUserToken, historiesRouter);
router.use('/signup', limiter.signUpLimiter, signupRouter);

module.exports = router;
