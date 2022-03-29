const express = require('express');
const router = express.Router();
const verifyParkingLotToken = require('../../middlewares/parking_lot/verifyParkingLotToken');
const verifyUserToken = require('../../middlewares/users/verifyUserToken');

// api folders
const parkingLotRouter = require('./parking_lot');
const parkingLotAuthenticateRouter = require('./parking_lot_authenticate');
const v0ParkingLotRouter = require('./v0_parking_lot');

const userRoute = require('./users');
const userAuthenticateRoute = require('./user_authenticate');
const parkingLotsRouter = require('./parking_lots');
const reserveRouter = require('./reserve');
const signupRouter = require('./signup');
const historiesRouter = require('./histories');
const vehiclesRouter = require('./vehicles');

// routes
router.use('/parking_lot', verifyParkingLotToken, parkingLotRouter);
router.use('/v0_parking_lot', verifyParkingLotToken, v0ParkingLotRouter);
router.use('/parking_lot_authenticate', parkingLotAuthenticateRouter);

// user routes:
router.use('/user', verifyUserToken, userRoute);
router.use('/user_authenticate', userAuthenticateRoute);
router.use('/parking_lots', verifyUserToken, parkingLotsRouter);
router.use('/reserve', verifyUserToken, reserveRouter);
router.use('/histories', verifyUserToken, historiesRouter);
router.use('/vehicles', verifyUserToken, vehiclesRouter);
router.use('/signup', signupRouter);

module.exports = router;
