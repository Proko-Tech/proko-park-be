const express = require('express');
const router = express.Router();
const {DateTime} = require('luxon');

const lotsModel = require('../../../../database/models/lotsModel');
const reservationsModel = require('../../../../database/models/reservationModel');
const spotsModel = require('../../../../database/models/spotsModel');
const usersModel = require('../../../../database/models/usersModel');
const notificationRequestsModel = require('../../../../database/models/notificationRequestsModel');
const defectsModel = require('../../../../database/models/defectsModel');
const lotOwnershipsModel = require('../../../../database/models/lotOwnershipsModel');

const mailer = require('../../../modules/mailer');


const crypto = require('crypto');

router.get('/reservations_count', async function(req, res) {
    try {
        const reservations_count =
            await lotsModel.getReservationsCountByLotId(req.lotInfo.id);
        const result = await lotsModel.getLotByHash(req.lotInfo.hash);

        const hourly_reservations_count = new Array(24).fill(0);
        for (let i=0; i<reservations_count.length; i++) {
            hourly_reservations_count[reservations_count[i].hour] =
                reservations_count[i].count;
        }
        return res.status(200).json({
            status: 'success',
            hourly_reservations_count, min_price: result.min_price_per_hour,
            max_price: result.max_price_per_hour,
        });
    } catch (err) {
        return res.status(500).json({
            err,
            status: 'failed',
            data: 'Unable to make request to server',
        });
    }
});

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
            spot_data.spot_status === 'UNOCCUPIED' &&
            previous_spot[0].spot_status === 'OCCUPIED';
        const is_parked_without_card_to_exit =
            previous_spot.length > 0 &&
            spot_data.spot_status === 'UNOCCUPIED' &&
            previous_spot[0].spot_status === 'OCCUPIED_WITHOUT_CARD';
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
        const is_unoccupied_to_parked_without_card = previous_spot.length > 0 &&
            previous_spot[0].spot_status === 'UNOCCUPIED' &&
            spot_data.spot_status === 'OCCUPIED_WITHOUT_CARD' &&
            !is_arrived_to_parked &&
            !is_reserved_to_parked &&
            !is_parked_to_exit;

        const date = DateTime.local().toUTC();
        if (is_unoccupied_to_parked || is_unoccupied_to_parked_without_card ||
            is_violation || is_violation_to_exit) {
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
        } else if (is_parked_to_exit || is_parked_without_card_to_exit) {
            reservation_status = 'success';
            spot_update_status = await spotsModel.updateSpotStatus(spot_data);
        }

        const is_update_success =
            spot_update_status.spot_status === 'success' &&
            lot_status === 'success' &&
            reservation_status === 'success';
        if (!is_update_success) {
            return res
                .status(500)
                .json({status: 'failed', data: 'Parking lot not updated'});
        }

        if (is_parked_to_exit || is_violation_to_exit) {
            const lot_info = await lotsModel.getById(lot_data.id);
            const notification_requests = await notificationRequestsModel
                .getByLotIdAndStatusJoinUsers(lot_data.id, 'REQUESTED');
            const user_emails = notification_requests
                .map((notification_request) => notification_request.email)

            mailer.sendAvailabilityNotification(
                user_emails.join(','),
                lot_info[0].name,
                async function(result) {
                    if (result.status === 'failed') {
                        await notificationRequestsModel
                            .updateRequestedOrErrorByLotId(
                                lot_data.id, {status: 'ERROR'});
                    }
                    await notificationRequestsModel
                        .updateRequestedOrErrorByLotId(
                            lot_data.id, {status: 'SENT'});
                });
        }

        return res
            .status(200)
            .json({status: 'success', data: 'Parking lot updated'});
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

router.post('/suggested_price', async function(req, res) {
    const {suggested_price} = req.body;
    try {
        const result = await lotsModel.getLotByHash(req.lotInfo.hash);
        if (result.apply_suggested_pricing) {
            await lotsModel.updateById(result.id, {
                suggested_price_per_hour: suggested_price,
                price_per_hour: suggested_price,
            });
        }
        await lotsModel.updateById(result.id, {
            suggested_price_per_hour: suggested_price,
        });
        return res.status(200).json({status: 'success', data: 'Price updated'});
    } catch (err) {
        res.status(500).json({
            err,
            status: 'failed',
            data: 'Unable to make request to server',
        });
    }
})

router.post('/:hash', async function(req, res) {
    const hash = req.params.hash;
    const spots = req.body;
    try {
        const result = await lotsModel.getLotAndSpotsByHash(hash);
        const {lot_status} = await lotsModel.markLotAliveStatusByIdAndHash(
            result,
        );
        const {reservation_status} =
            await reservationsModel.batchProcessSpotWOCamReservations(
                result.id,
                spots,
            );
        const {spot_status} = await spotsModel.batchUpdate(spots);

        const defected_spots = spots.filter((spot) => !spot.alive_status);
        const lot_auto_generated_defect = await defectsModel.getAutoGeneratedByStatusAndLotId('REQUESTED', result.id);
        if (defected_spots.length === spots.length &&
            lot_auto_generated_defect.length === 0) {
            const lot_ownership = await lotOwnershipsModel
                .getByLotId(result.id);
            if (lot_ownership.length === 0) {
                return res.status(200).json({status: 'success', parking_lot_info: result});
            }
            const random = Math.random().toString();
            const hash = crypto
                .createHash('sha1')
                .update(new Date() + random)
                .digest('hex');

            await defectsModel.insert({
                lot_id: result.id,
                admin_id: lot_ownership[0].lot_id,
                detail: 'Full system down, possible reason: WiFi Disconnected',
                subject: 'Sensors Offline',
                defected_item: 'SENSOR',
                status: 'REQUESTED',
                is_auto_generator: true,
                secret_hash: hash,
            });

            await mailer.sendTextEmail({
                from: process.env.EMAILUSER,
                to: process.env.CORE_ENG_EMAIL,
                subject: `❌[${result.name}] - Full system down`,
                text: 'A new defect has been created, check it out here: ' +
                    process.env.INTERNAL_DEFECT_LINK + `/${hash}`,
            });
        }

        const is_get_and_update_success =
            result && lot_status === 'success' && spot_status === 'success' && reservation_status === 'success';
        if (is_get_and_update_success) {
            return res.status(200).json({status: 'success', parking_lot_info: result});
        }

        return res.status(404).json({
            status: 'failed',
            data: 'Unable to find parking lot information',
        });
    } catch (err) {
        return res.status(500).json({
            err,
            status: 'failed',
            data: 'Unable to make request to server',
        });
    }
});

module.exports = router;
