const express = require('express');
const router = express.Router();

const lotsModel = require('../../../../database/models/lotsModel');
const spotsModel = require('../../../../database/models/spotsModel');

router.get('/:id', async function(req, res){
    const {id} = req.params;
    try {
        const result = await lotsModel.getAndUnoccupiedSpotNumsById(id);
        if (result) {
            res.status(200)
                .json({status: 'success', parking_lot_info: result});
        } else {
            res.status(404)
                .json({status:'failed', parking_lot_info: 'Unable to find parking lot information'});
        }
    } catch (err) {
        res.status(500)
            .json({err, status:'failed', data: 'Unable to make request to server'});
    }
});

module.exports = router;
