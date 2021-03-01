const express = require('express');
const router = express.Router();

const userModel = require('../../../../database/models/usersModel');
const vehicleModel = require('../../../../database/models/vehiclesModel');
const lotModel = require('../../../../database/models/lotsModel');
const reservationModel = require('../../../../database/models/reservationModel');

router.get('/parking_lot/:id', async function(req, res){
    const {id} = req.params;
    try {
        if (id === JSON.stringify(req.userInfo.id)) {
            const parking_lots = await reservationModel.getDistinctLotsByUserId(id);
            res.status(200).json({data:parking_lots, message: 'Parking lot histories found'});
        } else {
            res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
    } catch (err) {
        res.status(500)
            .json({err, message: 'Unable to get parking lot histories from database'})
    }
});

router.get('/:id', async function(req, res){
    const {id} = req.params;
    try {
        if (id === JSON.stringify(req.userInfo.id)) {
            const user = await userModel.getAllById(id);
            user.user.vehicles = await vehicleModel.getByUserId(id);
            const currentReservation = await reservationModel.getReservedByUserId(id);
            const currentArrivedTasks = await reservationModel.getArrivedByUserId(id);
            const currentParkedTasks = await reservationModel.getParkedByUserId(id);
            const isUserCurrentlyHasTask = currentReservation.length>0 || currentArrivedTasks.length>0 || currentParkedTasks.length>0;

            // TODO: add check current parked, and arrived
            let reservation_info = {};
            if (isUserCurrentlyHasTask) {
                if (currentReservation.length > 0) {
                    const vehicles = await vehicleModel.getById(currentReservation[0].vehicle_id);
                    const lots = await lotModel.getById(currentReservation[0].lot_id);
                    reservation_info = {
                        vehicle: vehicles[0],
                        parking_lot: lots[0],
                        status: 'RESERVED',
                    };
                }
                if (currentArrivedTasks.length > 0) {
                    const vehicles = await vehicleModel.getById(currentArrivedTasks[0].vehicle_id);
                    const lots = await lotModel.getById(currentArrivedTasks[0].lot_id);
                    reservation_info = {
                        vehicle: vehicles[0],
                        parking_lot: lots[0],
                        status: 'ARRIVED',
                    };
                }
                if (currentParkedTasks.length > 0) {
                    const vehicles = await vehicleModel.getById(currentParkedTasks[0].vehicle_id);
                    const lots = await lotModel.getById(currentParkedTasks[0].lot_id);
                    reservation_info = {
                        vehicle: vehicles[0],
                        parking_lot: lots[0],
                        status: 'PARKED',
                    };
                }
            }
            res.status(200).json({data: user, reservation_info, msg: 'User info was found'});
        } else {
            res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
    } catch (err) {
        res.status(500)
            .json({err, message: 'Unable to get user from database'})
    }
});

module.exports = router;
