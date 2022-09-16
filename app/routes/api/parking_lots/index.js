const express = require('express');
const router = express.Router();

const lotsModel = require('../../../../database/models/lotsModel');
const spotsModel = require('../../../../database/models/spotsModel');
const notificationRequestModel = require('../../../../database/models/notificationRequestsModel');

router.get('/search/:payload', async function(req, res) {
    const {payload} = req.params;
    try {
        const modified_search_string = '%'.concat(payload, '%');
        const result = await lotsModel.getByAlikeNameOrAddress(
            modified_search_string,
        );
        const parking_lot_info = await Promise.all(
            result.map((element) => {
                const lot_info = {
                    ...element,
                    lot_id: element.id,
                };
                return lot_info;
            }),
        );
        if (result) {
            return res.status(200).json({status: 'success', parking_lot_info});
        } else {
            return res
                .status(404)
                .json({
                    status: 'failed',
                    parking_lot_info: 'Unable to find parking lot information',
                });
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

router.get('/:lot_id', async function(req, res) {
    const {lot_id} = req.params;
    try {
        const result = await lotsModel.getAndUnoccupiedSpotNumsById(lot_id);
        result.spots = await lotsModel.getByIdJoinSpots(lot_id);
        result.available_electric_spots =
            await lotsModel.getAndUnoccupiedElectricSpotNumsById(lot_id);
        result.available_reservable_spots =
            await lotsModel.getAndReservableSpotNumsById(lot_id);
        result.available_non_reservable_spots =
            await lotsModel.getAndNonReservableSpotNumsById(lot_id);
        if (result) {
            return res
                .status(200)
                .json({status: 'success', parking_lot_info: result});
        } else {
            return res
                .status(404)
                .json({
                    status: 'failed',
                    parking_lot_info: 'Unable to find parking lot information',
                });
        }
    } catch (err) {
        console.log(err)
        return res
            .status(500)
            .json({
                err,
                status: 'failed',
                data: 'Unable to make request to server',
            });
    }
});

router.post('/closest', async function(req, res) {
    const {lat, long} = req.body;
    try {
        const result = await lotsModel.getClosestByLatLong(lat, long);
        const parking_lot_info = await Promise.all(
            result.map((element) => {
                const lot_info = {
                    ...element,
                    lot_id: element.id,
                };
                return lot_info;
            }),
        );
        if (result) {
            return res.status(200).json({status: 'success', parking_lot_info});
        } else {
            return res
                .status(404)
                .json({
                    status: 'failed',
                    parking_lot_info: 'Unable to find parking lot information',
                });
        }
    } catch (err) {
        return res
            .status(500)
            .json({
                err,
                status: 'failed',
                data: 'Unable to make request to server',
            });
    }
});

router.post('/notification', async function(req, res) {
    const {lot_id} = req.body;
    const user_id = req.userInfo.id;
    try {
        const notification_requests = await notificationRequestModel
            .getRequestedOrErrorByUserIdAndLotId(user_id, lot_id);
        if (notification_requests.length !== 0) {
            return res
                .status(400)
                .json({
                    status: 'failed',
                    msg: 'You already have a notification turned ' +
                        'on for this spot',
                });
        }

        const free_spots = await spotsModel.getUnoccupiedByLotId(lot_id);
        if (free_spots.length !== 0) {
            return res
                .status(400)
                .json({
                    status: 'failed',
                    msg: 'A free spot is found in this garage',
                });
        }

        const notification = await notificationRequestModel
            .insert({user_id, lot_id, status: 'REQUESTED'});
        if (notification.status === 'failed') {
            return res
                .status(500)
                .json({
                    status: 'failed',
                    msg: 'Insert failed due to server error',
                });
        }

        return res
            .status(200)
            .json({status: 'success', data: notification});

    } catch (err) {
        console.log(err)
        return res
            .status(500)
            .json({
                err,
                status: 'failed',
                msg: 'Insert failed due to server error',
            });
    }
})

module.exports = router;
