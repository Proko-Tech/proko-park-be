const express = require('express');
const router = express.Router();
const verifyParkingLotToken = require('../../middlewares/parking_lot/verifyParkingLotToken');

// api folders
const parkingLotRouter = require('./parking_lot');
const parkingLotAuthenticateRouter = require('./parking_lot_authenticate');

// routes
router.use('/parking_lot', verifyParkingLotToken, parkingLotRouter);
router.use('/parking_lot_authenticate', parkingLotAuthenticateRouter);

module.exports = router;
