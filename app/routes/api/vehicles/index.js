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

router.put('/accept', async function(req, res){
    const {id} = req.userInfo;
    const {vehicle_id} = req.body;

    try {
        const vehicle_ownership = await vehicleOwnershipModel.getByUserIdAndVehicleId(id, vehicle_id);
        const isAuthroized = vehicle_ownership.length !== 0;
        if (!isAuthroized){
            return res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
        await vehicleOwnershipModel.updateById(vehicle_ownership[0].id, {status: 'ACCEPTED'});
        return res.status(200).json({status: 'success', message: 'Successfully updated ownership record'});
    } catch (err){
        return res.status(500)
            .json({err, message: 'Unable to accept vehicle ownership due to server errors'});
    }
});

router.delete('/deleteOwnership/:ownership_id', async function(req, res){
    const {id} = req.userInfo;
    const {ownership_id} = req.params;
    try {
        const ownership_info = await vehicleOwnershipModel.getById(ownership_id);
        const isOwnershipExist = ownership_info.length !== 0;
        if (!isOwnershipExist) {
            return res.status(404)
                .json({status: 'failed', message: 'Ownership information not found'});
        }
        const vehicle_id = ownership_info[0].vehicle_id;
        const primary_owner = await vehicleOwnershipModel.getByUserIdAndVehicleId(id, vehicle_id);
        const isPrimaryOwner = primary_owner.length!==0 && primary_owner[0].is_primary_owner;
        if (!isPrimaryOwner){
            return res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
        await vehicleOwnershipModel.deleteById(ownership_id);
        return res.status(200).json({status: 'success', message: 'Successfully deleted ownership record'});
    } catch (err){
        return res.status(500)
            .json({err, message: 'Unable to accept vehicle ownership due to server errors'});
    }
});

module.exports = router;
