const express = require('express');
const router = express.Router();

const usersModel = require('../../../../database/models/usersModel');
const vehiclesModel = require('../../../../database/models/vehiclesModel');
const vehicleOwnershipModel = require('../../../../database/models/vehicleOwnershipModel');

router.post('/', async function(req, res){
    const {id} = req.userInfo;
    try {
        await vehiclesModel.insertPrimaryOwner(req.body, id);
        return res.status(200).json({status: 'success', message: 'Successfully inserted vehicle'});
    } catch (err){
        return res.status(500)
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
            return res.status(200).json({status: 'success', vehicle_ownership_records, message: 'Successfully retrieved ownership info'});
        } else {
            return res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
    } catch (err){
        return res.status(500)
            .json({err, message: 'Unable to insert vehicle due to server errors'})
    }
});

router.post('/ownership', async function(req, res){
    const {id} = req.userInfo;
    const {vehicle_id, invitee_email} = req.body;
    try {
        const ownershipInfo = await vehicleOwnershipModel.getByUserIdAndVehicleId(id, vehicle_id);
        const isOwnershipExist = ownershipInfo.length > 0;
        const isUserPrimaryOwner = isOwnershipExist? ownershipInfo[0].is_primary_owner : false;
        const isAuthorized = isOwnershipExist && isUserPrimaryOwner;
        if (!isAuthorized){
            return res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }

        const inviteeInfo = await usersModel.getByEmail(invitee_email);
        const isInviteeExist = inviteeInfo.length>0;
        if (!isInviteeExist){
            return res.status(404)
                .json({status: 'failed', message: 'Invitee email not found'});
        }

        const inviteeOwnerShipInfo = await vehicleOwnershipModel.getByUserIdAndVehicleId(inviteeInfo[0].id, vehicle_id);

        if (inviteeOwnerShipInfo.length > 0){
            return res.status(403)
                .json({status: 'failed', message: 'Already invited'});
        }

        const record = {
            user_id: inviteeInfo[0].id,
            vehicle_id, is_primary_owner: 0, status: 'INVITED',
        };

        await vehicleOwnershipModel.insert(record);
        return res.status(200).json({status: 'success', message: 'Successfully inserted ownership record'});
    } catch (err){
        return res.status(500)
            .json({err, message: 'Unable to insert vehicle ownership due to server errors'})
    }
});

module.exports = router;
