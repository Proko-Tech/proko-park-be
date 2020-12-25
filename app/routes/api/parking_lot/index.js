const express = require('express');
const router = express.Router();

const lotsModel = require('../../../../database/models/lotsModel');
const spotsModel = require('../../../../database/models/spotsModel');

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

module.exports = router;
