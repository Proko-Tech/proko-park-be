const express = require('express');
const router = express.Router();

const lotsModel = require('../../../../database/models/lotsModel');
const spotsModel = require('../../../../database/models/spotsModel');
const reservationModel = require('../../../../database/models/reservationModel');
const vehicleOwnershipModel = require('../../../../database/models/vehicleOwnershipModel');
const vehiclesModel = require('../../../../database/models/vehiclesModel');
const usersModel = require('../../../../database/models/usersModel');

const stripeCustomer = require('../../../../services/stripe/customers');

const mailer = require('../../../modules/mailer');

router.post('/', async function(req, res){
    const userInfo = req.userInfo;
    const {lot_id, vehicle_id, card_id} = req.body;
    try {
        const unoccupiedSpots = await spotsModel.getUnoccupiedByLotId(lot_id);
        const vehicleOwnerRecords = await vehicleOwnershipModel.getByUserIdAndVehicleId(userInfo.id, vehicle_id);
        const userCurrentReservedTasks = await reservationModel.getReservedByUserIdAndLotId(userInfo.id, lot_id);
        const userCurrentArrivedTasks = await reservationModel.getArrivedByUserIdAndLotId(userInfo.id, lot_id);
        const userCurrentParkedTasks = await reservationModel.getParkedByUserIdAndLotId(userInfo.id, lot_id);
        const user = await usersModel.getById(userInfo.id);

        const isUserCurrentlyHasTask = userCurrentArrivedTasks.length>0 || userCurrentParkedTasks.length>0 || userCurrentReservedTasks.length>0;
        const isLotFull = unoccupiedSpots.length === 0;
        const isUserOwnVehicle = vehicleOwnerRecords.length>0;

        const isUserValid = user.length !== 0;
        const cardInformation = await stripeCustomer.getCardByCustomerId(user[0].stripe_customer_id, card_id);
        const isValidReservation = !isUserCurrentlyHasTask && !isLotFull && isUserOwnVehicle && isUserValid;

        if (isValidReservation){
            const {reservation_status} = await reservationModel.insertAndHandleReserve(lot_id, userInfo.id, vehicle_id, card_id);
            if (reservation_status === 'failed'){
                res.status(404)
                    .json({status: 'failed', data: 'Unauthorized reservation'});
            }
            const vehicles = await vehiclesModel.getById(vehicle_id);
            const lots = await lotsModel.getById(lot_id);
            const reservation_info = {
                vehicle: vehicles[0],
                parking_lot: lots[0],
                status: 'RESERVED',
            };
            await mailer.sendReservationConfirmation(lots[0], vehicles[0], cardInformation.card, user[0].email, user[0].first_name, async function(err, resData) {
                if (err) {
                    console.log(err);
                }
            });
            res.status(200)
                .json({status: 'success', reservation_info});
        } else {
            res.status(404)
                .json({status: 'failed', data: 'Unauthorized reservation'});
        }
    } catch (err){
        console.log(err);
        res.status(500)
            .json({err, data: 'Unable to reserve parking spot, internal server error'});
    }
});

module.exports = router;
