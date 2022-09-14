const express = require('express');
const router = express.Router();
const {DateTime} = require('luxon');

const lotsModel = require('../../../../database/models/lotsModel');
const reservationsModel = require('../../../../database/models/reservationModel');
const spotsModel = require('../../../../database/models/spotsModel');
const vehiclesModel = require('../../../../database/models/vehiclesModel');
const usersModel = require('../../../../database/models/usersModel');
const notificationRequestModel = require('../../../../database/models/notificationRequestsModel');

const mailer = require('../../../modules/mailer');

const stripePayment = require('../../../../services/stripe/payment');
const stripeCustomer = require('../../../../services/stripe/customers');

router.put('/spot', async function(req, res) {
    const lot_data = req.lotInfo;
    const spot_data = req.body.spotInfo;
    try {
        const previous_spot = await spotsModel.getBySecret(spot_data.secret);
        const {lot_status} = await lotsModel.markLotAliveStatusByIdAndHash(
            lot_data,
        );
        const previous_arrived_reservation =
            await reservationsModel.getArrivedBySpotHashAndLotId(
                spot_data.secret,
                lot_data.id,
            );
        const previous_reserved_reservation =
            await reservationsModel.getReservedBySpotHashAndLotId(
                spot_data.secret,
                lot_data.id,
            );
        const previous_parked_reservation =
            await reservationsModel.getParkedBySpotHashAndLotId(
                spot_data.secret,
                lot_data.id,
            );

        let reservation_status = 'failed';
        let spot_update_status = 'failed';
        const is_arrived_to_parked =
            previous_spot.length > 0 &&
            previous_arrived_reservation.length > 0 &&
            spot_data.spot_status === 'OCCUPIED' &&
            previous_spot[0].spot_status === 'RESERVED' &&
            previous_arrived_reservation[0].status === 'ARRIVED';
        const is_reserved_to_parked =
            previous_spot.length > 0 &&
            previous_reserved_reservation.length > 0 &&
            spot_data.spot_status === 'OCCUPIED' &&
            previous_spot[0].spot_status === 'RESERVED' &&
            previous_reserved_reservation[0].status === 'RESERVED';
        const is_parked_to_exit =
            previous_spot.length > 0 &&
            previous_parked_reservation.length > 0 &&
            spot_data.spot_status === 'UNOCCUPIED' &&
            previous_spot[0].spot_status === 'OCCUPIED' &&
            previous_parked_reservation[0].status === 'PARKED';
        const is_violation_to_exit =
            previous_spot.length > 0 &&
            spot_data.spot_status === 'UNOCCUPIED' &&
            previous_spot[0].spot_status === 'VIOLATION';
        const is_violation =
            previous_spot.length > 0 && spot_data.spot_status === 'VIOLATION';
        const is_unoccupied_to_parked =
            previous_spot.length > 0 &&
            previous_spot[0].spot_status === 'UNOCCUPIED' &&
            spot_data.spot_status === 'OCCUPIED' &&
            !is_arrived_to_parked &&
            !is_reserved_to_parked &&
            !is_parked_to_exit;

        const date = DateTime.local().toUTC();
        if (is_unoccupied_to_parked) {
            // reservation updated in cloud vision server
            reservation_status = 'success';
            spot_update_status = await spotsModel.updateSpotStatus(spot_data);
        } else if (is_arrived_to_parked) {
            const reservation_info = {
                parked_at: date.toSQL({includeOffset: false}),
                status: 'PARKED',
            };
            const status = await reservationsModel.updateById(
                previous_arrived_reservation[0].id,
                reservation_info,
            );
            reservation_status = status.reservation_status;
            spot_update_status = await spotsModel.updateSpotStatus(spot_data);
        } else if (is_reserved_to_parked) {
            const reservation_info = {
                arrived_at: date.toSQL({includeOffset: false}),
                parked_at: date.toSQL({includeOffset: false}),
                status: 'PARKED',
            };
            const status = await reservationsModel.updateById(
                previous_reserved_reservation[0].id,
                reservation_info,
            );
            reservation_status = status.reservation_status;
            spot_update_status = await spotsModel.updateSpotStatus(spot_data);
        } else if (is_parked_to_exit) {
            const reservation_info = {
                exited_at: date.toSQL({includeOffset: false}),
                status: 'FULFILLED',
            };
            const status = await reservationsModel.updateById(
                previous_parked_reservation[0].id,
                reservation_info,
            );
            reservation_status = status.reservation_status;

            const availableSpots = await spotsModel.getUnoccupiedReservableByLotId(lot_data.id);
            const isParkingLotFull = availableSpots.length === 0;
            if (isParkingLotFull) {
                const notificationRequested = await notificationRequestModel.getByLotIdAndStatus(lot_data.id, 'REQUESTED');
                for (let i = 0; i < notificationRequested.length; i++) {
                    const user = await usersModel.getById(notificationRequested[i].user_id);
                    await mailer.sendAvailabilityNotification(
                        user[0].first_name,
                        user[0].email,
                        lot_data.name,
                        async function(err,res){
                            const notificationUpdateInfo = {
                                status: 'SENT',
                            };
                            if (err) {
                                console.log(err);
                                notificationUpdateInfo.status = 'ERROR';
                            }
                            await notificationRequestModel.updateById(notificationRequested[i].id, notificationUpdateInfo);
                        },
                    )
                }
            }

            spot_update_status = await spotsModel.updateSpotStatus(spot_data);

            // calculate elapsed time, calculate price, execute payment
            if (
                reservation_status === 'success' &&
                previous_parked_reservation[0].user_id !== -1
            ) {
                const diff = Math.abs(
                    date.valueOf() -
                        previous_parked_reservation[0].parked_at.valueOf(),
                );
                const hour_diff = Math.ceil(diff / 1000 / 60 / 60);
                const user = await usersModel.getById(
                    previous_parked_reservation[0].user_id,
                );
                const lot = await lotsModel.getByIdAndHash(
                    lot_data.id,
                    lot_data.hash,
                );
                const amount = hour_diff * lot[0].price_per_hour * 100;
                const description =
                    date +
                    'Parking session at ' +
                    lot[0].name +
                    ' ' +
                    lot[0].hash;
                if (previous_parked_reservation[0].vehicle_id !== -1) {
                    const vehicle = await vehiclesModel.getById(
                        previous_parked_reservation[0].vehicle_id,
                    );
                    const stripe_card =
                        await stripeCustomer.getCardByCustomerId(
                            user[0].stripe_customer_id,
                            previous_parked_reservation[0].card_id,
                        );
                    const charge =
                        await stripePayment.authorizeByCustomerAndSource(
                            amount,
                            description,
                            user[0].stripe_customer_id,
                            previous_parked_reservation[0].card_id,
                        );
                    const update_reservation_info = {
                        is_paid: true,
                        stripe_charge_id: charge.id,
                        total_price: amount / 100.0,
                        elapsed_time: hour_diff,
                    };
                    await mailer.sendReceipt(
                        lot[0],
                        vehicle[0],
                        stripe_card,
                        user[0].email,
                        user[0].first_name,
                        amount,
                        hour_diff,
                        async function(err, res) {
                            if (err) {
                                console.log(err);
                            }
                        },
                    );
                    const update_status = await reservationsModel.updateById(
                        previous_parked_reservation[0].id,
                        update_reservation_info,
                    );
                    reservation_status = update_status.reservation_status;
                } else {
                    const charge = await stripePayment.authorizeByCustomer(
                        amount,
                        description,
                        user[0].stripe_customer_id,
                    );
                    const update_reservation_info = {
                        is_paid: true,
                        stripe_charge_id: charge.id,
                        total_price: amount / 100.0,
                        elapsed_time: hour_diff,
                    };
                    await mailer.sendReceipt(
                        lot[0],
                        null,
                        charge.payment_method_details.card,
                        user[0].email,
                        user[0].first_name,
                        amount,
                        hour_diff,
                        async function(err, res) {
                            if (err) {
                                console.log(err);
                            }
                        },
                    );
                    const update_status = await reservationsModel.updateById(
                        previous_parked_reservation[0].id,
                        update_reservation_info,
                    );
                    reservation_status = update_status.reservation_status;
                }
            }
        } else if (is_violation) {
            // TODO: dynamic reallocation
            reservation_status = 'success';
            spot_update_status = await spotsModel.updateSpotStatus(spot_data);
        } else if (is_violation_to_exit) {
            reservation_status = 'success';

            const availableSpots = await spotsModel.getUnoccupiedReservableByLotId(lot_data.id);
            const isParkingLotFull = availableSpots.length === 0;
            if (isParkingLotFull) {
                const notificationRequested = await notificationRequestModel.getByLotIdAndStatus(lot_data.id, 'REQUESTED')
                for (let i = 0; i < notificationRequested.length; i++) {
                    const user = await usersModel.getById(notificationRequested[i].user_id)
                    await mailer.sendAvailabilityNotification(
                        user[0].first_name,
                        user[0].email,
                        lot_data.name,
                        async function(err,res){
                            const notificationUpdateInfo = {
                                status: 'SENT',
                            };
                            if(err) {
                                console.log(err);
                                notificationUpdateInfo.status = 'ERROR';
                            }
                            await notificationRequestModel.updateById(notificationRequested[i].id, notificationUpdateInfo)
                        },
                    )
                }
            }

            spot_update_status = await spotsModel.updateSpotStatus(spot_data);
        }

        const is_update_success =
            spot_update_status.spot_status === 'success' &&
            lot_status === 'success' &&
            reservation_status === 'success';
        if (is_update_success) {
            return res
                .status(200)
                .json({status: 'success', data: 'Parking lot updated'});
        } else {
            return res
                .status(404)
                .json({status: 'failed', data: 'Parking lot not updated'});
        }
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({
                err,
                status: 'failed',
                data: 'Unable to make request to server',
            });
    }
});

router.post('/scan', async function(req, res) {
    const lot_data = req.lotInfo;
    const {email} = req.body;
    try {
        const user = await usersModel.getByEmail(email);
        if (user.length === 0) {
            return res
                .status(404)
                .json({status: 'failed', data: 'user info not found'});
        }
        const reservation = await reservationsModel.getByUserIdAndLotId(
            user[0].id,
            lot_data.id,
        );
        const user_reserved_tasks =
            await reservationsModel.getReservedByUserIdAndLotId(
                user[0].id,
                lot_data.id,
            );
        const user_arrived_tasks =
            await reservationsModel.getArrivedByUserIdAndLotId(
                user[0].id,
                lot_data.id,
            );
        const user_parked_tasks =
            await reservationsModel.getParkedByUserIdAndLotId(
                user[0].id,
                lot_data.id,
            );
        const is_empty = reservation.length === 0;
        const newest_index = reservation.length - 1;
        const is_paid = reservation[newest_index].is_paid;
        const is_elapsed_time_zero =
            reservation[newest_index].elapsed_time == 0;
        const is_reserved = reservation[newest_index].status === 'RESERVED';
        const is_user_currently_has_task =
            user_arrived_tasks.length > 0 ||
            user_parked_tasks.length > 0 ||
            user_reserved_tasks.length > 0;
        const is_reservation_valid =
            !is_empty && !is_paid && is_elapsed_time_zero && is_reserved;
        const is_fcfs_user = !is_user_currently_has_task;
        if (is_reservation_valid) {
            const spot = await spotsModel.getBySecret(
                reservation[newest_index].spot_hash,
            );
            const is_spot_exist = spot.length === 1;
            const is_spot_reserved = spot[0].spot_status === 'RESERVED';
            const is_spot_valid = is_spot_exist && is_spot_reserved;
            const date = DateTime.local().toUTC();
            if (is_spot_valid) {
                const reservation_info = {
                    arrived_at: date.toSQL({includeOffset: false}),
                    status: 'ARRIVED',
                };
                const {reservation_status} = await reservationsModel.updateById(
                    reservation[newest_index].id,
                    reservation_info,
                );
                return res
                    .status(200)
                    .json({status: reservation_status, data: spot[0]});
            } else {
                return res
                    .status(404)
                    .json({
                        status: 'failed',
                        data: 'Reservation not found in system',
                    });
            }
        } else {
            // TODO: add first come first serve edits
            if (!is_fcfs_user) {
                return res
                    .status(404)
                    .json({
                        status: 'failed',
                        data: 'User currently has unfinished parking.',
                    });
            }
            const unoccupied_spots =
                await spotsModel.getUnoccupiedNotElectricByLotId(lot_data.id);
            const is_lot_full = unoccupied_spots.length === 0;

            if (is_lot_full)
                return res
                    .status(404)
                    .json({status: 'failed', data: 'Parking Lot Full'});

            const {reservation_status} =
                await reservationsModel.insertAndHandleFCFSNonElectricArrive(
                    lot_data.id,
                    user[0].id,
                );
            const reservation = await reservationsModel.getByUserIdAndLotId(
                user[0].id,
                lot_data.id,
            );
            const newest_index = reservation.length - 1;
            const spot = await spotsModel.getBySecret(
                reservation[newest_index].spot_hash,
            );

            return res
                .status(200)
                .json({status: reservation_status, data: spot[0]});
        }
    } catch (err) {
        res.status(500).json({
            err,
            status: 'failed',
            data: 'Unable to make request to server',
        });
    }
});

router.post('/:hash', async function(req, res) {
    const hash = req.params.hash;
    const spots = req.body;
    try {
        const result = await lotsModel.getLotAndSpotsByHash(hash);
        const {lot_status} = await lotsModel.markLotAliveStatusByIdAndHash(
            result,
        );
        const {spot_status} = await spotsModel.batchUpdate(spots);
        const is_get_and_update_success =
            result && lot_status === 'success' && spot_status === 'success';
        if (is_get_and_update_success) {
            res.status(200).json({status: 'success', parking_lot_info: result});
        } else {
            res.status(404).json({
                status: 'failed',
                data: 'Unable to find parking lot information',
            });
        }
    } catch (err) {
        res.status(500).json({
            err,
            status: 'failed',
            data: 'Unable to make request to server',
        });
    }
});

module.exports = router;
