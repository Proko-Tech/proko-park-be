const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');

const pick = require('../../../../utils/pick');
const mailer = require('../../../modules/mailer');

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
            .json({err, message: 'Unable to get parking lot histories from database'});
    }
});

router.put('/', async function(req, res){
    const {id} = req.userInfo;
    try {
        const status = await userModel.updateById(id, req.body);
        if (status.uodate_status) {
            res.status(200).json({status: 'success'});
        } else {
            res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
    } catch (err){
        res.status(500)
            .json({err, message: 'Unable to change user Info due to server error'});
    }
});

router.post('/check_password', async function(req, res){
    const {id} = req.userInfo;
    try {
        const result = await userModel.getById(id);
        const isUserExist = result.length !== 0;
        if (!isUserExist) return res.status(403).json({message: 'User does not exist'});
        const isPasswordMatched = bcrypt.compareSync(req.body.password, result[0].password);
        if (isPasswordMatched) {
            return res.status(200).json({message: 'Password matched'});
        } else {
            return res.status(404).json({message: 'Password matched'});
        }
    } catch (err){
        res.status(500)
            .json({err, message: 'Unable to check password due to server error'});
    }
});

router.put('/attributes/password', async function(req, res){
    const {id} = req.userInfo;
    try {
        const password_json = {
            password: bcrypt.hashSync(req.body.password, null, null),
        };
        const result = await userModel.updateById(id, password_json);
        if (result.uodate_status === 'success')
            return res.status(200).json({message: 'Password matched'});
        else
            return res.status(404).json({message: 'Password reset failed'});
    } catch (err){
        res.status(500)
            .json({err, message: 'Unable to check password due to server error'});
    }
});

router.put('/attributes/verify_email', async function(req, res){
    const {id} = req.userInfo;
    try {
        const result = await userModel.getById(id);
        const isUserExist = result.length!==0;
        if (!isUserExist) return res.status(403).json({message: 'User does not exist'});
        const isMatched = result[0].verify_code === req.body.verify_code;
        if (!isMatched) {
            return res.status(404).json({message: 'Code not matched'});
        }
        const update_json = {
            is_verified: true,
        };
        const status = await userModel.updateById(id, update_json);
        if (status.uodate_status==='success')
            return res.status(200).json({message: 'Password matched'});
        else
            return res.status(404).json({message: 'Update failed'});
    } catch (err){
        res.status(500)
            .json({err, message: 'Unable to check password due to server error'});
    }
});

router.get('/send_code', async function(req, res){
    const {id} = req.userInfo;
    try {
        const result = await userModel.getById(id);
        const mailerInfo = {
            ...pick(result[0], ['first_name', 'last_name', 'email', 'verify_code']),
        };
        await mailer.sendEmail(mailerInfo, async function(err, resData) {
            if (err) {
                console.log(err);
            }
        });
        res.status(200)
            .json({status: 'success', message: 'code sent successfully'});
    } catch (err){
        res.status(500)
            .json({err, message: 'Unable to resend code due to server error'});
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

router.post('/checkEmail', async function(req, res){
    const email = req.body.email;
    try {
        const users = await usersModel.getByEmail(email);
        if (users.length!=0) {
            res.status(401)
                .json({status: 'failed', msg: 'Another account using this email was found'});
        } else {
            res.status(200)
                .json({status: 'success', message: 'success'});
        }
    } catch (err) {
        res.status(500)
            .json({err, message: 'Unable to get user from database'})
    }
});

module.exports = router;
