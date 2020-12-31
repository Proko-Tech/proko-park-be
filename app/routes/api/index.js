const express = require('express');
const router = express.Router();
const verifyParkingLotToken = require('../../middlewares/parking_lot/verifyParkingLotToken');

// api folders
const parkingLotRouter = require('./parking_lot');
const parkingLotAuthenticateRouter = require('./parking_lot_authenticate');

const userRoute = require('./users');
const userAuthenticateRoute = require('./user_authenticate');

// routes
router.use('/parking_lot', verifyParkingLotToken, parkingLotRouter);
router.use('/parking_lot_authenticate', parkingLotAuthenticateRouter);

// user routes:
router.use('/user', userRoute);
router.use('/user_authenticate', userAuthenticateRoute);

module.exports = router;
