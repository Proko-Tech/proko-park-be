const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');

const pick = require('../../../../utils/pick');
const mailer = require('../../../modules/mailer');
const stripeCustomer = require('../../../../services/stripe/customers');

const userModel = require('../../../../database/models/usersModel');
const vehicleModel = require('../../../../database/models/vehiclesModel');
const lotModel = require('../../../../database/models/lotsModel');
const reservationModel = require('../../../../database/models/reservationModel');
const spotsModel = require('../../../../database/models/spotsModel');
const vehicleOwnershipModel = require('../../../../database/models/vehicleOwnershipModel')

router.get('/parking_lot/:id', async function(req, res) {
    const {id} = req.params;
    try {
        if (id === JSON.stringify(req.userInfo.id)) {
            const parking_lots = await reservationModel.getDistinctLotsByUserId(
                id,
            );
            return res
                .status(200)
                .json({
                    data: parking_lots,
                    message: 'Parking lot histories found',
                });
        } else {
            return res
                .status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
    } catch (err) {
        return res
            .status(500)
            .json({
                err,
                message: 'Unable to get parking lot histories from database',
            });
    }
});

router.put('/', async function(req, res) {
    const {id} = req.userInfo;
    try {
        const status = await userModel.updateById(id, req.body);
        if (status.update_status) {
            return res.status(200).json({status: 'success'});
        } else {
            return res
                .status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
    } catch (err) {
        return res
            .status(500)
            .json({
                err,
                message: 'Unable to change user Info due to server error',
            });
    }
});

router.post('/check_password', async function(req, res) {
    const {id} = req.userInfo;
    try {
        const result = await userModel.getById(id);
        const isUserExist = result.length !== 0;
        if (!isUserExist)
            return res.status(403).json({message: 'User does not exist'});
        const isPasswordMatched = bcrypt.compareSync(
            req.body.password,
            result[0].password,
        );
        if (isPasswordMatched) {
            return res.status(200).json({message: 'Password matched'});
        } else {
            return res.status(404).json({message: 'Password not matched'});
        }
    } catch (err) {
        return res
            .status(500)
            .json({
                err,
                message: 'Unable to check password due to server error',
            });
    }
});

router.put('/attributes/password', async function(req, res) {
    const {id} = req.userInfo;
    try {
        const password_json = {
            password: bcrypt.hashSync(req.body.password, null, null),
        };
        const result = await userModel.updateById(id, password_json);
        if (result.update_status === 'success')
            return res.status(200).json({message: 'Password matched'});
        else return res.status(404).json({message: 'Password reset failed'});
    } catch (err) {
        return res
            .status(500)
            .json({
                err,
                message: 'Unable to check password due to server error',
            });
    }
});

router.put('/attributes/verify_email', async function(req, res) {
    const {id} = req.userInfo;
    try {
        const result = await userModel.getById(id);
        const isUserExist = result.length !== 0;
        if (!isUserExist)
            return res.status(403).json({message: 'User does not exist'});
        const isMatched = result[0].verify_code === req.body.verify_code;
        if (!isMatched) {
            return res.status(404).json({message: 'Code not matched'});
        }
        const update_json = {
            is_verified: true,
        };
        const status = await userModel.updateById(id, update_json);
        if (status.update_status === 'success')
            return res.status(200).json({message: 'Code matched'});
        else return res.status(404).json({message: 'Update failed'});
    } catch (err) {
        return res
            .status(500)
            .json({
                err,
                message: 'Unable to check password due to server error',
            });
    }
});

router.get('/send_code', async function(req, res) {
    const {id} = req.userInfo;
    try {
        const result = await userModel.getById(id);
        const mailerInfo = {
            ...pick(result[0], [
                'first_name',
                'last_name',
                'email',
                'verify_code',
            ]),
        };
        await mailer.sendEmail(mailerInfo, async function(err, resData) {
            if (err) {
                console.log(err);
            }
        });
        return res
            .status(200)
            .json({status: 'success', message: 'code sent successfully'});
    } catch (err) {
        return res
            .status(500)
            .json({err, message: 'Unable to resend code due to server error'});
    }
});

router.post('/addCard', async function(req, res) {
    const {id} = req.userInfo;
    const {card_source} = req.body;
    try {
        const result = await userModel.getById(id);
        if (result.length === 0) {
            return res
                .status(404)
                .json({status: 'failed', message: 'User not found'});
        }
        const cardInfo = await stripeCustomer.addNewCardByCustomerId(
            card_source,
            result[0].stripe_customer_id,
        );
        return res
            .status(200)
            .json({
                status: 'success',
                message: 'add card successfully',
                card: cardInfo,
            });
    } catch (err) {
        return res
            .status(500)
            .json({err, message: 'Unable to resend code due to server error'});
    }
});

router.delete('/deleteCard/:card_source', async function(req, res) {
    const {id} = req.userInfo;
    const {card_source} = req.params;
    try {
        const result = await userModel.getById(id);
        if (result.length === 0) {
            return res
                .status(404)
                .json({status: 'failed', message: 'User not found'});
        }
        const cardInfo = await stripeCustomer.removeCardByCustomerId(
            card_source,
            result[0].stripe_customer_id,
        );
        return res
            .status(200)
            .json({
                status: 'success',
                message: 'remove card successfully',
                card: cardInfo,
            });
    } catch (err) {
        return res
            .status(500)
            .json({err, message: 'Unable to resend code due to server error'});
    }
});

router.get('/:id', async function(req, res) {
    const {id} = req.params;
    try {
        if (id === JSON.stringify(req.userInfo.id)) {
            const user = await userModel.getAllById(id);
            user.user.vehicles = await vehicleModel.getByUserId(id);
            const currentReservation =
                await reservationModel.getReservedByUserId(id);
            const currentArrivedTasks =
                await reservationModel.getArrivedByUserId(id);
            const currentParkedTasks = await reservationModel.getParkedByUserId(
                id,
            );
            const isUserCurrentlyHasTask =
                currentReservation.length > 0 ||
                currentArrivedTasks.length > 0 ||
                currentParkedTasks.length > 0;

            // TODO: add check current parked, and arrived
            let reservation_info = {};
            if (isUserCurrentlyHasTask) {
                if (currentReservation.length > 0) {
                    const vehicles = await vehicleModel.getById(
                        currentReservation[0].vehicle_id,
                    );
                    const lots = await lotModel.getById(
                        currentReservation[0].lot_id,
                    );
                    const spots = await spotsModel.getBySecret(
                        currentReservation[0].spot_hash,
                    );
                    reservation_info = {
                        vehicle: vehicles[0],
                        parking_lot: lots[0],
                        status: 'RESERVED',
                        reserved_at: currentReservation[0].reserved_at,
                        arrived_at: currentReservation[0].arrived_at,
                        parked_at: currentReservation[0].parked_at,
                        reservation_id: currentReservation[0].id,
                        spot: spots[0],
                    };
                }
                if (currentArrivedTasks.length > 0) {
                    const vehicles = await vehicleModel.getById(
                        currentArrivedTasks[0].vehicle_id,
                    );
                    const lots = await lotModel.getById(
                        currentArrivedTasks[0].lot_id,
                    );
                    const spots = await spotsModel.getBySecret(
                        currentArrivedTasks[0].spot_hash,
                    );
                    reservation_info = {
                        vehicle: vehicles[0],
                        parking_lot: lots[0],
                        status: 'ARRIVED',
                        reserved_at: currentArrivedTasks[0].reserved_at,
                        arrived_at: currentArrivedTasks[0].arrived_at,
                        parked_at: currentArrivedTasks[0].parked_at,
                        reservation_id: currentArrivedTasks[0].id,
                        spot: spots[0],
                    };
                }
                if (currentParkedTasks.length > 0) {
                    const vehicles = await vehicleModel.getById(
                        currentParkedTasks[0].vehicle_id,
                    );
                    const lots = await lotModel.getById(
                        currentParkedTasks[0].lot_id,
                    );
                    const spots = await spotsModel.getBySecret(
                        currentParkedTasks[0].spot_hash,
                    );
                    reservation_info = {
                        vehicle: vehicles[0],
                        parking_lot: lots[0],
                        status: 'PARKED',
                        reserved_at: currentParkedTasks[0].reserved_at,
                        arrived_at: currentParkedTasks[0].arrived_at,
                        parked_at: currentParkedTasks[0].parked_at,
                        reservation_id: currentParkedTasks[0].id,
                        spot: spots[0],
                    };
                }
            }
            const card_information = await stripeCustomer.getCardsByCustomerId(
                user.user.stripe_customer_id,
            );
            return res
                .status(200)
                .json({
                    data: user,
                    reservation_info,
                    card_information,
                    msg: 'User info was found',
                });
        } else {
            return res
                .status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({err, message: 'Unable to get user from database'});
    }
});

router.delete('/', async function(req, res) {
    const {id} = req.userInfo;
    const {actions} = req.body;

    try {
        //Delete co-owned vehicles by removing ownership from db
        const coOwnedVehicles = await vehicleOwnershipModel.getCoOwnedByUserId(id);
        const coOwnedExists = coOwnedVehicles.length !== 0;
        if (coOwnedExists) {
            await vehicleOwnershipModel.deleteCoOwnedByUserId(id);
        }
    
        // Delete all primary vehicles
        const deletablePrimaryVehicles = actions.map(action => action.vehicle.id) // List of ID
        const deletablePrimaryVehiclesExists = deletablePrimaryVehicles.length !== 0;
        if (deletablePrimaryVehiclesExists) {
            await vehicleModel.batchDeleteByIdTransactOwnership(deletablePrimaryVehicles)
        }

        // Reassign all primary vehicles specified by user
        const vehiclesToAssign = actions.filter(action => action.action === 'REASSIGN')
        const vehiclesToAssignExists = vehiclesToAssign.length !== 0;

        if (vehiclesToAssignExists) {
            const ownershipAndUsers = await vehicleOwnershipModel.getOwnershipJoinUser();
            const updateList = [];
            const insertList = [];
            const createQueryLists = (action) => {
                // Index of vehicle that already exists in db
                const index = ownershipAndUsers.findIndex(row => action.reassigned_user === row.email & action.vehicle.id === row.vehicle_id & !row.is_primary_owner)
                if (index !== -1) {
                    updateList.push({user_id: ownershipAndUsers[index].user_id, vehicle_id: ownershipAndUsers[index].vehicle_id});
                } else {
                    const convertedEmailIndex = ownershipAndUsers.findIndex(row => row.email === action.reassigned_user)
                    insertList.push({vehicle_id: action.vehicle.id, is_primary_owner: 1, status: 'ACCEPTED', user_id: ownershipAndUsers[convertedEmailIndex].id});
                }
            }
            vehiclesToAssign.forEach(createQueryLists) // Populate lists
            await vehicleOwnershipModel.batchInsertTransferOwnership(insertList, id)
            updateList.forEach(async(update) => await vehicleOwnershipModel.batchUpdateTransferOwnership(update))
        }

        // Delete user information from user table
        const user = await userModel.getById(id)
        const isUserExist = user.length !== 0;
        if (!isUserExist) return res.status(404).json({message: 'User does not exist'});
        await userModel.deleteById(id);
        return res.status(200).json({status: "success", message: "Successfully deleted user account"});
    } catch (err) {
        return res.status(500)
            .json({err, message: 'Unable to delete user account due to server error'});
    }
});

router.get('/verify_email/:email', async function(req, res) {
    try {
        const {email} = req.params;
        const user = await userModel.getByEmail(email)
        const isUserExist = user.length !== 0;
        return !isUserExist ? res.status(404).json({message: 'User does not exist'}) : res.status(200).json({status: "success", message: "User exists"})
    } catch (err) {
        return res.status(500).json({err, message: 'Unable to verify email due to server error'})
    }
})

module.exports = router;
