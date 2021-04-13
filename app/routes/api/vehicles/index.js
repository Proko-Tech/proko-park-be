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
    const {id, email} = req.userInfo;
    const {vehicle_id, invitee_email} = req.body;
    try {
        if (email === invitee_email){
            return res.status(401)
                .json({status: 'failed', message: 'Unauthorized action, cannot invite yourself'});
        }
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

router.put('/transfer_ownership', async function(req, res){
    const {id} = req.userInfo;
    const {invitee_id, vehicle_id} = req.body;

    try {
        const user_ownership = await vehicleOwnershipModel.getByUserIdAndVehicleId(id, vehicle_id);
        const isAuthorized = user_ownership.length !== 0 && user_ownership[0].is_primary_owner;
        if (!isAuthorized){
            return res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }

        const invitee_ownership = await vehicleOwnershipModel.getByUserIdAndVehicleId(invitee_id, vehicle_id);
        const isInviteeOwnershipExist = invitee_ownership.length !== 0;
        if (!isInviteeOwnershipExist){
            return res.status(404)
                .json({status: 'failed', message: 'Ownership information not found'});
        }

        if (invitee_ownership[0].status !== 'ACCEPTED'){
            return res.status(403)
                .json({status: 'failed', message: 'Invitee not yet accepted invite as a co-owner'});
        }

        await vehicleOwnershipModel.updateById(user_ownership[0].id, {is_primary_owner: 0});
        await vehicleOwnershipModel.updateById(invitee_ownership[0].id, {is_primary_owner: 1});

        return res.status(200).json({status: 'success', message: 'Successfully transfer ownership record'});
    } catch (err){
        return res.status(500)
            .json({err, message: 'Unable to change vehicle ownership due to server errors'});
    }
});

router.delete('/delete_ownership/:ownership_id', async function(req, res){
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

router.delete('/co_owner_remove/:vehicle_id', async function(req, res){
    const {vehicle_id} = req.params;
    const {id} = req.userInfo;

    try {
        const ownership_info = await vehicleOwnershipModel.getByUserIdAndVehicleId(id, vehicle_id);
        const vehicle_info = await vehiclesModel.getById(vehicle_id);
        const isOwnershipAndVehicleExist = ownership_info.length !== 0 && vehicle_info.length !== 0;
        if (!isOwnershipAndVehicleExist) {
            return res.status(404)
                .json({status: 'failed', message: 'Ownership or vehicle information not found'});
        }
        const isPrimaryOwner = ownership_info[0].is_primary_owner;
        if (isPrimaryOwner){
            return res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
        await vehicleOwnershipModel.deleteById(ownership_info[0].id);
        return res.status(200).json({status: 'success', message: 'Successfully deleted vehicle and ownership record'});
    } catch (err){
        return res.status(500)
            .json({err, message: 'Unable to delete vehicle due to server errors'});
    }
});


router.delete('/:vehicle_id', async function(req, res){
    const {vehicle_id} = req.params;
    const {id} = req.userInfo;

    try {
        const ownership_info = await vehicleOwnershipModel.getByUserIdAndVehicleId(id, vehicle_id);
        const vehicle_info = await vehiclesModel.getById(vehicle_id);
        const isOwnershipAndVehicleExist = ownership_info.length !== 0 && vehicle_info.length !== 0;
        if (!isOwnershipAndVehicleExist) {
            return res.status(404)
                .json({status: 'failed', message: 'Ownership or vehicle information not found'});
        }
        const isPrimaryOwner = ownership_info[0].is_primary_owner;
        if (!isPrimaryOwner){
            return res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }

        await vehiclesModel.deleteByIdTransactOwnership(vehicle_id);
        return res.status(200).json({status: 'success', message: 'Successfully deleted vehicle and ownership record'});
    } catch (err){
        return res.status(500)
            .json({err, message: 'Unable to delete vehicle due to server errors'});
    }
});

module.exports = router;
