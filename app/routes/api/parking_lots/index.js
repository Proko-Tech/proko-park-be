const express = require('express');
const router = express.Router();

const lotsModel = require('../../../../database/models/lotsModel');
const spotsModel = require('../../../../database/models/spotsModel');

router.get('/search/:payload', async function(req, res){
    const {payload} = req.params;
    try {
        const modified_search_string = '%'.concat(payload, '%');
        const result = await lotsModel.getByAlikeNameOrAddress(modified_search_string);
        const parking_lot_info = await Promise.all(result.map((element) => {
            const lot_info = {
                ...element,
                lot_id: element.id,
            };
            return lot_info;
        }));
        if (result) {
            return res.status(200)
                .json({status: 'success', parking_lot_info});
        } else {
            return res.status(404)
                .json({status:'failed', parking_lot_info: 'Unable to find parking lot information'});
        }
    } catch (err) {
        console.log(err);
        return res.status(500)
            .json({err, status:'failed', data: 'Unable to make request to server'});
    }
});

router.get('/:id', async function(req, res){
    const {id} = req.params;
    try {
        const result = await lotsModel.getAndUnoccupiedSpotNumsById(id);
        result.available_electric_spots = await lotsModel.getAndUnoccupiedElectricSpotNumsById(id);
        result.available_reservable_spots = await lotsModel.getAndReservableSpotNumsById(id);
        result.available_non_reservable_spots = await lotsModel.getAndNonReservableSpotNumsById(id);
        if (result) {
            return res.status(200)
                .json({status: 'success', parking_lot_info: result});
        } else {
            return res.status(404)
                .json({status:'failed', parking_lot_info: 'Unable to find parking lot information'});
        }
    } catch (err) {
        return res.status(500)
            .json({err, status:'failed', data: 'Unable to make request to server'});
    }
});

router.post('/closest', async function(req, res){
    const {lat, long} = req.body;
    try {
        const result = await lotsModel.getClosestByLatLong(lat, long);
        const parking_lot_info = await Promise.all(result.map((element) => {
            const lot_info = {
                ...element,
                lot_id: element.id,
            };
            return lot_info;
        }));
        if (result) {
            return res.status(200)
                .json({status: 'success', parking_lot_info});
        } else {
            return res.status(404)
                .json({status:'failed', parking_lot_info: 'Unable to find parking lot information'});
        }
    } catch (err) {
        return res.status(500)
            .json({err, status:'failed', data: 'Unable to make request to server'});
    }
});

module.exports = router;
