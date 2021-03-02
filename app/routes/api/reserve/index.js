const express = require('express');
const router = express.Router();

const lotsModel = require('../../../../database/models/lotsModel');
const spotsModel = require('../../../../database/models/spotsModel');
const reservationModel = require('../../../../database/models/reservationModel');
const vehicleOwnershipModel = require('../../../../database/models/vehicleOwnershipModel');
const vehiclesModel = require('../../../../database/models/vehiclesModel');

router.post('/', async function(req, res){
    const userInfo = req.userInfo;
    const {lot_id, vehicle_id} = req.body;
    try {
        const unoccupiedSpots = await spotsModel.getUnoccupiedByLotId(lot_id);
        const vehicleOwnerRecords = await vehicleOwnershipModel.getByUserIdAndVehicleId(userInfo.id, vehicle_id);
        const userCurrentReservedTasks = await reservationModel.getReservedByUserIdAndLotId(userInfo.id, lot_id);
        const userCurrentArrivedTasks = await reservationModel.getArrivedByUserIdAndLotId(userInfo.id, lot_id);
        const userCurrentParkedTasks = await reservationModel.getParkedByUserIdAndLotId(userInfo.id, lot_id);

        const isUserCurrentlyHasTask = userCurrentArrivedTasks.length>0 || userCurrentParkedTasks.length>0 || userCurrentReservedTasks.length>0;
        const isLotFull = unoccupiedSpots.length === 0;
        const isUserOwnVehicle = vehicleOwnerRecords.length>0;

        const isValidReservation = !isUserCurrentlyHasTask && !isLotFull && isUserOwnVehicle;

        if (isValidReservation){
            const {reservation_status} = await reservationModel.insertAndHandleReserve(lot_id, userInfo.id, vehicle_id);
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
            res.status(200)
                .json({status: 'success', reservation_info});
        } else {
            res.status(404)
                .json({status: 'failed', data: 'Unauthorized reservation'});
        }
    } catch (err){
        res.status(500)
            .json({err, data: 'Unable to reserve parking spot, internal server error'});
    }
});

module.exports = router;
