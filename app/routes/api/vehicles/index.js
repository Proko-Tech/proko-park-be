const express = require('express');
const router = express.Router();

const vehiclesModel = require('../../../../database/models/vehiclesModel');
const vehicleOwnershipModel = require('../../../../database/models/vehicleOwnershipModel');

router.post('/', async function(req, res){
    const {id} = req.userInfo;
    try {
        await vehiclesModel.insertPrimaryOwner(req.body, id);
        res.status(200).json({status: 'success', message: 'Successfully inserted vehicle'});
    } catch (err){
        res.status(500)
            .json({err, message: 'Unable to insert vehicle due to server errors'})
    }
});

router.get('/ownership/:vehicle_id', async function(req, res){
    const {vehicle_id} = req.params;
    const {id} = req.userInfo;
    try {
        const vehicleOwnerRecords = await vehicleOwnershipModel.getByUserIdAndVehicleId(id, vehicle_id);
        const isUserOwnVehicle = vehicleOwnerRecords.length>0;
        if (isUserOwnVehicle){
            const vehicle_ownership_records = await vehicleOwnershipModel.getByVehicleIdJoinUser(vehicle_id);
            res.status(200).json({status: 'success', vehicle_ownership_records, message: 'Successfully inserted vehicle'});
        } else {
            res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
    } catch (err){
        res.status(500)
            .json({err, message: 'Unable to insert vehicle due to server errors'})
    }
});

module.exports = router;
