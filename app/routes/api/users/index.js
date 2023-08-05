const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const {DateTime} = require('luxon');

const pick = require('../../../../utils/pick');
const mailer = require('../../../modules/mailer');
const stripeCustomer = require('../../../../services/stripe/customers');

const userModel = require('../../../../database/models/usersModel');
const vehicleModel = require('../../../../database/models/vehiclesModel');
const lotModel = require('../../../../database/models/lotsModel');
const notificationRequestsModel = require('../../../../database/models/notificationRequestsModel');
const reservationModel = require('../../../../database/models/reservationModel');
const spotsModel = require('../../../../database/models/spotsModel');
const vehicleOwnershipModel = require('../../../../database/models/vehicleOwnershipModel')
const stripe = require("stripe");

router.get('/parking_lot/:id', async function(req, res) {
    const {id} = req.params;
    try {
        if (id === JSON.stringify(req.userInfo.id)) {
            const parking_lots = await reservationModel.getDistinctLotsByUserId(
                id,
            );
            await userModel.updateById(req.userInfo.id, {
                last_logged_in_at:
                    DateTime.local().toUTC().toSQL({includeOffset: false}),
            });
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

router.post('/addCardIntent', async function(req, res) {
    const {id} = req.userInfo;
    const {stripe_customer_id, payment_method_types = []} = req.body;
    try {
        const user_info = await userModel.getById(id);
        if (user_info.length === 0) {
            return res
                .status(404)
                .json({status: 'failed', message: 'User not found'});
        }
        if (user_info[0].stripe_customer_id !== stripe_customer_id) {
            return res.status(401)
                .json({status: 'failed', message: 'Stripe customer id not matched'});
        }
        const ephemeral_key =
            await stripeCustomer.getEphemeralKeyByCustomerId(
                stripe_customer_id);
        const setup_intent =
            await stripeCustomer.createSetupIntentByCustomerId(
                stripe_customer_id, payment_method_types);
        return res
            .status(200)
            .json({
                status: 'success',
                message: 'Add card intent setup successfully',
                setup_intent, ephemeral_key,
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

        const cardInfo = card_source.startsWith('pm') ?
            await stripeCustomer.removePaymentMethodByPaymentMethodId(
                card_source,
            ) :
            await stripeCustomer.removeCardByCustomerId(
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
        console.error(err);
        return res
            .status(500)
            .json({err, message: 'Unable to resend code due to server error'});
    }
});

router.get('/:id', async function(req, res) {
    const {id} = req.params;
    try {
        if (id !== JSON.stringify(req.userInfo.id)) {
            return res
                .status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
        const user = await userModel.getAllById(id);
        user.user.vehicles = await vehicleModel.getByUserId(id);
        const currentTask =
            await reservationModel.getReservedOrArrivedOrParkedByUserId(id);

        const isUserCurrentlyHasTask = currentTask.length > 0;

        let reservation_info = {};
        if (isUserCurrentlyHasTask) {
            const vehicles = await vehicleModel.getById(
                currentTask[0].vehicle_id,
            );
            const lots = await lotModel.getById(
                currentTask[0].lot_id,
            );
            const spots = await spotsModel.getBySecret(
                currentTask[0].spot_hash,
            );
            const card = currentTask[0].card_id.startsWith('pm') ?
                await stripeCustomer.getPaymentMethodsByCustomerIdAndPMId(
                    user.user.stripe_customer_id,
                    currentTask[0].card_id,
                ) : await stripeCustomer
                    .getCardByCustomerId(user.user.stripe_customer_id,
                        currentTask[0].card_id);

            reservation_info = {
                vehicle: vehicles[0],
                parking_lot: lots[0],
                status: currentTask[0].status,
                reserved_at: currentTask[0].reserved_at,
                arrived_at: currentTask[0].arrived_at,
                parked_at: currentTask[0].parked_at,
                reservation_id: currentTask[0].id,
                spot: spots[0],
                card,
            };
        }

        const card_information = await stripeCustomer.getCardsByCustomerId(
            user.user.stripe_customer_id,
        );
        const notification_requests = await notificationRequestsModel
            .getRequestedOrErrorByUserId(id);
        const notification_requests_map = {}
        await notification_requests.forEach((object) => {
            notification_requests_map[object.lot_id] = object
        });
        return res
            .status(200)
            .json({
                data: user,
                reservation_info,
                card_information,
                notification_requests_map,
                msg: 'User info was found',
            });
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
        // Delete all vehicle ownership records
        const vehicleOwnership = await vehicleOwnershipModel.getByUserId(id);
        const vehicleOwnershipExists = vehicleOwnership.length !== 0;
        if (vehicleOwnershipExists) {
            await vehicleOwnershipModel.deleteByUserId(id);
        }

        // Delete all primary vehicles specified by user + any ownership records belonging to any co-owners
        const deletablePrimaryVehicles = actions.filter((action) => action.action === 'DELETE').map((action) => action.vehicle.id) // List of ID
        const deletablePrimaryVehiclesExists =
            deletablePrimaryVehicles.length !== 0;
        if (deletablePrimaryVehiclesExists) {
            await vehicleModel.batchDeleteById(deletablePrimaryVehicles)
        }

        // Reassign all primary vehicles specified by user
        const vehiclesToAssign = actions.filter((action) => action.action === 'REASSIGN')
        const vehiclesToAssignExists = vehiclesToAssign.length !== 0;

        if (vehiclesToAssignExists) {
            const vehicleIds = actions.map((action) => action.vehicle.id)
            const ownershipAndUsers = await vehicleOwnershipModel
                .getOwnershipJoinUser(vehicleIds);
            const updateList = [];
            const insertList = [];
            const createQueryLists = (action) => {
                // Checks if person you are reassigning vehicle to is a co-owner
                const coOwnerIndex = ownershipAndUsers.findIndex((row) =>
                    action.reassigned_user === row.email &
                    !row.is_primary_owner,
                )
                // Add information to update list if the target reassignment is a co-owner
                if (coOwnerIndex !== -1) {
                    updateList.push({
                        user_id: ownershipAndUsers[coOwnerIndex].user_id,
                        vehicle_id: ownershipAndUsers[coOwnerIndex].vehicle_id,
                    });
                    return;
                } else {
                    // Otherwise, store new row information of non-cowowners (don't exist in ownershipAndUsers)
                    insertList.push({
                        vehicle_id: action.vehicle.id,
                        is_primary_owner: 1, status: 'ACCEPTED',
                        user_id: action.reassigned_user,
                    });
                }
            }

            vehiclesToAssign.forEach(createQueryLists) // Populate lists

            // If there are rows to be inserted, convert emails to user ID
            if (insertList.length !== 0) {
                const newOwnerIds = await userModel.batchSelectByEmail(
                    insertList.map((row) => row.user_id),
                );
                const convertEmailToUserId = (insertRow, index, array) => {
                    const indexOfUserId = newOwnerIds.findIndex(
                        (idRow) => idRow.email === insertRow.user_id,
                    )
                    array[index].user_id = newOwnerIds[indexOfUserId].id
                }
                insertList.forEach(convertEmailToUserId);
            }
            await vehicleOwnershipModel.batchInsertOwnership(
                insertList,
            )
            const newOwnership = {is_primary_owner: 1, status: 'ACCEPTED'};
            updateList.forEach(
                async (update) =>
                    await vehicleOwnershipModel.updateByUserIdAndVehicleId(
                        update,
                        newOwnership,
                    ),
            )
        }

        // Delete user information from user table
        const user = await userModel.getById(id)
        const isUserExist = user.length !== 0;
        if (!isUserExist) return res.status(404).json({message: 'User does not exist'});
        await userModel.deleteById(id);
        return res.status(200).json({status: "success", message: "Successfully deleted user account"});
    } catch (err) {
        console.log(err)
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
