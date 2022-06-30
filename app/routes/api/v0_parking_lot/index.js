const express = require('express');
const router = express.Router();

const lotsModel = require('../../../../database/models/lotsModel');
const spotsModel = require('../../../../database/models/spotsModel');

router.put('/spot', async function(req, res){
    const lotInfo = req.lotInfo;
    const {spotInfo} = req.body;
    try {
        const previous_spot = await spotsModel.getBySecret(spotInfo.secret);
        const {lot_status} = await lotsModel.markLotAliveStatusByIdAndHash(lotInfo);
        if (lot_status === 'failed') {
            return res.status(500)
                .json({err, status:'failed', data: 'Lot update failed'});
        }
        if (previous_spot.spot_status === spotInfo.spot_status) {
            return res.status(401).json({err, status: 'failed', data: 'Status not changed'});
        }
        spotInfo.lot_id = lotInfo.id;
        const {spot_status} = await spotsModel.updateSpotStatus(spotInfo);
        if (spot_status === 'failed') {
            return res.status(500)
                .json({err, status:'failed', data: 'Spot update failed'});
        }
        return res.status(200).json({status:'success', data:'spot lot updated'});
    } catch (err){
        console.log(err);
        return res.status(500)
            .json({err, status:'failed', data: 'Unable to make request to server'});
    }
});

module.exports = router;
