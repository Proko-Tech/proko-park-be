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
        const {spot_status} = await spotsModel.updateSpotStatus(spotInfo);
        const {lot_status} = await lotsModel.markLotAliveStatusByIdAndHash(lotInfo);
        const isUpdateSuccess = spot_status === 'success' && lot_status === 'success';
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
        const isReservationValid = !isEmpty && !isPaid && isElapsedTimeZero;
        if (isReservationValid){
            const spotInfo = await spotsModel.getBySecret(reservationInfo[newestIndex].spot_hash);
            const isSpotExist = spotInfo.length===1;
            const isSpotReserved = spotInfo[0].spot_status === 'RESERVED';
            const isSpotValid = isSpotExist && isSpotReserved;
            if (isSpotValid){
                res.status(200)
                    .json({status:'success', data: spotInfo[0]});
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
