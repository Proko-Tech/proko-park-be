const express = require('express');
const router = express.Router();

const lotsModel = require('../../../../database/models/lotsModel');
const reservationsModel = require('../../../../database/models/reservationModel');
const spotsModel = require('../../../../database/models/spotsModel');
const usersModel = require('../../../../database/models/usersModel');

router.get('/:hash', async function(req, res){
    const hash = req.params.hash;
    try {
        const result = await lotsModel.getLotAndSpotsByHash(hash);
        const {lot_status} = await lotsModel.markLotAliveStatusByIdAndHash(result);
        const isGetAndUpdateSuccess = result && lot_status === 'success';
        if (isGetAndUpdateSuccess) {
            res.status(200)
                .json({status: 'success', parking_lot_info: result});
        } else {
            res.status(404)
                .json({status:'failed', data: 'Unable to find parking lot information'});
        }
    } catch (err) {
        res.status(500)
            .json({err, status:'failed', data: 'Unable to make request to server'});
    }
});

router.put('/spot', async function(req, res){
    const lotInfo = req.lotInfo;
    const {spotInfo} = req.body;
    try {
        const previous_spot = await spotsModel.getBySecret(spotInfo.secret);
        const {lot_status} = await lotsModel.markLotAliveStatusByIdAndHash(lotInfo);
        const previous_arrived_reservation = await reservationsModel.getArrivedBySpotHashAndLotId(spotInfo.secret, lotInfo.id);
        const previous_parked_reservation = await reservationsModel.getParkedBySpotHashAndLotId(spotInfo.secret, lotInfo.id);

        let reservation_status = 'failed';
        let spot_update_status = 'failed';
        const isReservedToArrived = previous_spot.length > 0 && previous_arrived_reservation.length>0 && spotInfo.spot_status==='OCCUPIED' && previous_spot[0].spot_status === 'RESERVED' && previous_arrived_reservation[0].status === 'ARRIVED';
        const isArrivedToExited = previous_spot.length > 0 && previous_parked_reservation.length>0 && spotInfo.spot_status==='UNOCCUPIED' && previous_spot[0].spot_status === 'OCCUPIED' && previous_parked_reservation[0].status === 'PARKED';
        if (isReservedToArrived){
            const reservation_info = {
                parked_at: new Date(),
                status: 'PARKED',
            };
            const status = await reservationsModel.updateById(previous_arrived_reservation[0].id, reservation_info);
            reservation_status = status.reservation_status;
            spot_update_status = await spotsModel.updateSpotStatus(spotInfo);
        } else if (isArrivedToExited){
            const reservation_info = {
                exited_at: new Date(),
                status: 'FULFILLED',
            };
            const status = await reservationsModel.updateById(previous_parked_reservation[0].id, reservation_info);
            reservation_status = status.reservation_status;
            spot_update_status = await spotsModel.updateSpotStatus(spotInfo);
            // TODO calculate elapsed time, calculate price, execute payment
        }
        const isUpdateSuccess = spot_update_status.spot_status === 'success' && lot_status === 'success' && reservation_status === 'success';
        if (isUpdateSuccess){
            res.status(200).json({status:'success', data:'Parking lot updated'});
        } else {
            res.status(404)
                .json({status:'failed', data: 'Parking lot not updated'});
        }
    } catch (err){
        res.status(500)
            .json({err, status:'failed', data: 'Unable to make request to server'});
    }
});

router.post('/scan', async function(req, res){
    const lotInfo = req.lotInfo;
    const {email} = req.body;
    try {
        const userInfo = await usersModel.getByEmail(email);
        if (userInfo.length === 0){
            res.status(404)
                .json({status:'failed', data: 'user info not found'});
        }
        const reservationInfo = await reservationsModel.getByUserIdAndLotId(userInfo[0].id, lotInfo.id);
        const isEmpty = reservationInfo.length === 0;
        const newestIndex = reservationInfo.length-1;
        const isPaid = reservationInfo[newestIndex].is_paid;
        const isElapsedTimeZero = reservationInfo[newestIndex].elapsed_time==0;
        const isReserved = reservationInfo[newestIndex].status === 'RESERVED';
        const isReservationValid = !isEmpty && !isPaid && isElapsedTimeZero && isReserved;
        if (isReservationValid){
            const spotInfo = await spotsModel.getBySecret(reservationInfo[newestIndex].spot_hash);
            const isSpotExist = spotInfo.length===1;
            const isSpotReserved = spotInfo[0].spot_status === 'RESERVED';
            const isSpotValid = isSpotExist && isSpotReserved;
            if (isSpotValid){
                const reservation_info = {
                    arrived_at: new Date(),
                    status: 'ARRIVED',
                };
                const {reservation_status} = await reservationsModel.updateById(reservationInfo[newestIndex].id, reservation_info);
                res.status(200)
                    .json({status:reservation_status, data: spotInfo[0]});
            } else {
                res.status(404)
                    .json({status:'failed', data: 'Reservation not found in system'});
            }
        } else {
            res.status(404)
                .json({status:'failed', data: 'Reservation not found in system'});
        }
    } catch (err){
        res.status(500)
            .json({err, status:'failed', data: 'Unable to make request to server'});
    }
});

module.exports = router;
