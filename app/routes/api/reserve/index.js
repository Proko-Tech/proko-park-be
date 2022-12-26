const express = require('express');
const router = express.Router();
const {DateTime} = require('luxon');

const lotsModel = require('../../../../database/models/lotsModel');
const spotsModel = require('../../../../database/models/spotsModel');
const reservationModel = require('../../../../database/models/reservationModel');
const vehicleOwnershipModel = require('../../../../database/models/vehicleOwnershipModel');
const vehiclesModel = require('../../../../database/models/vehiclesModel');
const usersModel = require('../../../../database/models/usersModel');

const stripeCustomer = require('../../../../services/stripe/customers');
const stripePayment = require('../../../../services/stripe/payment');

const mailer = require('../../../modules/mailer');

router.post('/', async function(req, res) {
    const userInfo = req.userInfo;
    const {lot_id, vehicle_id, card_id} = req.body;
    try {
        const unoccupiedSpots =
            await spotsModel.getUnoccupiedNotElectricAndReservableByLotId(
                lot_id,
            );
        const vehicleOwnerRecords =
            await vehicleOwnershipModel.getByUserIdAndVehicleId(
                userInfo.id,
                vehicle_id,
            );
        const userCurrentReservedTasks =
            await reservationModel.getReservedByUserIdAndLotId(
                userInfo.id,
                lot_id,
            );
        const userCurrentArrivedTasks =
            await reservationModel.getArrivedByUserIdAndLotId(
                userInfo.id,
                lot_id,
            );
        const userCurrentParkedTasks =
            await reservationModel.getParkedByUserIdAndLotId(
                userInfo.id,
                lot_id,
            );
        const user = await usersModel.getById(userInfo.id);

        const isUserCurrentlyHasTask =
            userCurrentArrivedTasks.length > 0 ||
            userCurrentParkedTasks.length > 0 ||
            userCurrentReservedTasks.length > 0;
        const isLotFull = unoccupiedSpots.length === 0;
        const isUserOwnVehicle = vehicleOwnerRecords.length > 0;

        const isUserValid = user.length !== 0;
        const cardInformation = await stripeCustomer.getCardByCustomerId(
            user[0].stripe_customer_id,
            card_id,
        );
        const isValidReservation =
            !isUserCurrentlyHasTask &&
            !isLotFull &&
            isUserOwnVehicle &&
            isUserValid;

        if (isValidReservation) {
            const {reservation_status} =
                await reservationModel.insertAndHandleNonElectricReserve(
                    lot_id,
                    userInfo.id,
                    vehicle_id,
                    card_id,
                );
            if (reservation_status === 'failed') {
                return res
                    .status(401)
                    .json({status: 'failed', data: 'Unauthorized reservation'});
            }
            const vehicles = await vehiclesModel.getById(vehicle_id);
            const lots = await lotsModel.getById(lot_id);
            const reservation =
                await reservationModel.getReservedByUserIdAndLotId(
                    userInfo.id,
                    lot_id,
                );
            const spots = await spotsModel.getBySecret(
                reservation[0].spot_hash,
            );
            const reservation_info = {
                vehicle: vehicles[0],
                parking_lot: lots[0],
                status: 'RESERVED',
                reservation_id: reservation[0].id,
                spot: spots[0],
            };
            await mailer.sendReservationConfirmation(
                lots[0],
                vehicles[0],
                cardInformation.card,
                user[0].email,
                user[0].first_name,
                async function(err, resData) {
                    if (err) {
                        console.log(err);
                    }
                },
            );
            return res.status(200).json({status: 'success', reservation_info});
        } else {
            let message = 'Unauthorized reservation';
            if (isUserCurrentlyHasTask) {
                message =
                    'The system detected you have unfulfilled reservation';
            } else if (isLotFull) {
                message = 'Parking lot is full';
            }
            return res.status(401).json({status: 'failed', data: message});
        }
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({
                err,
                data: 'Unable to reserve parking spot, internal server error',
            });
    }
});

router.get('/can_cancel', async function(req, res) {
    const {id} = req.userInfo;
    try {
        const dateTwoHoursAgo = DateTime.local().minus({hours: 2}).toUTC();
        const canceled_reservations =
            await reservationModel.getCanceledAfterDateAndUid(
                id,
                dateTwoHoursAgo.toSQL({includeOffset: false}),
            );
        const isCancelValid = canceled_reservations.length < 3;
        return res.status(200).json({status: 'success', isCancelValid});
    } catch (err) {
        return res
            .status(500)
            .json({
                err,
                data: 'Unable to cancel reservation, internal server error',
            });
    }
});

router.put('/cancel', async function(req, res) {
    const {reservation_id} = req.body;
    const {id} = req.userInfo;
    try {
        const reservation = await reservationModel.getById(reservation_id);
        if (reservation[0].user_id !== id)
            return res
                .status(401)
                .json({status: 'failed', data: 'Unauthorized reservation'});
        const dateTwoHoursAgo = DateTime.local().minus({hours: 2}).toUTC();
        const canceled_reservations =
            await reservationModel.getCanceledAfterDateAndUid(
                id,
                dateTwoHoursAgo.toSQL({includeOffset: false}),
            );
        const isCancelValid = canceled_reservations.length < 3;
        if (!isCancelValid) {
            const userInfo = await usersModel.getById(id);
            const amount = 400;
            const description = 'Cancellation Fee 3 times';
            const charge = await stripePayment.authorizeByCustomerAndSource(
                amount,
                description,
                userInfo[0].stripe_customer_id,
                reservation[0].card_id,
            );
            const result = await reservationModel.updateCancelById(
                reservation_id,
                {
                    stripe_charge_id: charge.id,
                    total_price: amount / 100,
                    status: 'CANCELED',
                },
            );
            if (result.reservation_status !== 'success')
                return res
                    .status(500)
                    .json({
                        status: 'failed',
                        data: 'Cannot cancel due to internal server error',
                    });
            return res.status(200).json({status: 'success'});
        }
        const result = await reservationModel.updateCancelById(reservation_id, {
            total_price: 0,
            status: 'CANCELED',
        });
        if (result.reservation_status !== 'success')
            return res
                .status(500)
                .json({
                    status: 'failed',
                    data: 'Cannot cancel due to internal server error',
                });
        return res.status(200).json({status: 'success'});
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({
                err,
                data: 'Unable to cancel reservation, internal server error',
            });
    }
});

router.put('/add_payment', async function(req, res) {
    const {reservation_id, card_id, spot_public_key} = req.body;
    const user_id = req.userInfo.id;
    try {
        const users = await usersModel.getById(user_id);
        const spots = await spotsModel.getByPublicKey(spot_public_key);

        if (users.length === 0 || spots.length === 0) {
            return res.status(404).json({msg: 'Spot or user not found.'});
        }

        if (reservation_id !== undefined) {
            const reservations = await reservationModel
                .getById(reservation_id);
            if (reservations.length === 0) {
                return res.status(404).json({msg: 'Reservation not found.'});
            }

            if (reservations[0].status === 'FULFILLED' ||
                reservations[0].status === 'CANCELED' ||
                reservations[0].user_id !== user_id ||
                reservations[0].spot_hash !== spots[0].secret) {
                return res.status(401).json({msg: 'User cannot change this record.'});
            }

            const result = await reservationModel.updateByIdAndHandleSpotStatus(
                reservation_id, {user_id, card_id}, {spot_status: 'OCCUPIED'},
            );

            if (result.reservation_status !== 'success')
                return res
                    .status(500)
                    .json({
                        status: 'failed',
                        data: 'Cannot cancel due to internal server error',
                    });
            return res.status(200).json({status: 'success'});
        }

        if (spots[0].spot_status !== 'UNOCCUPIED') {
            return res.status(401).json({msg: 'User cannot change this record.'});
        }

        const current_time = DateTime.local()
            .toUTC()
            .toSQL({includeOffset: false});
        const new_reservation = {
            user_id,
            vehicle_id: -1,
            license_plate: 'NOT_YET_READ',
            spot_hash: spots[0].secret,
            lot_id: spots[0].lot_id,
            card_id,
            reserved_at: current_time,
            arrived_at: current_time,
            status: 'ARRIVED',
        }
        const result = await reservationModel
            .insertAndUpdateSpotBySpotId(
                new_reservation, spots[0].id, {manual_capture: true});
        if (result.reservation_status !== 'success')
            return res
                .status(500)
                .json({
                    status: 'failed',
                    data: 'Cannot cancel due to internal server error',
                });
        return res.status(200).json({status: 'success'});
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({
                err,
                data: 'Unable to cancel reservation, internal server error',
            });
    }
});

router.get('/:spot_public_key', async function(req, res) {
    const {spot_public_key} = req.params;
    const {id} = req.userInfo;
    try {
        let reservation_info = await reservationModel
            .getReservedArrivedOrParkedBySpotPublicKeyJoinSpotsAndLots(
                spot_public_key);
        if (reservation_info.length !== 0 &&
            reservation_info[0].user_id !== id) {
            return res.status(401)
                .json({status: 'failed', reservation_info: []});
        }
        if (reservation_info.length !== 0 && reservation_info[0].card_id) {
            return res.status(200)
                .json({status: 'success', reservation_info: reservation_info[0]});
        }
        reservation_info = await lotsModel
            .getBySpotPublicKeyJoinLots(spot_public_key);
        if (reservation_info.length === 0) {
            return res.status(404).json({status: 'failed',
                reservation_info: []});
        }
        return res.status(200).json({status: 'success', reservation_info: reservation_info[0]});
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({
                err,
                data: 'Unable to get reservation, internal server error',
            });
    }
});


module.exports = router;
