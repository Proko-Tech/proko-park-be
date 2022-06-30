const express = require('express');
const router = express.Router();

const lotsModel = require('../../../../database/models/lotsModel');

const lotToken = require('../../../auth/parking_lot/tokenUtil');

router.post('/', async function(req, res){
    const {id, hash} = req.body;
    try {
        const rows = await lotsModel.getByIdAndHash(id, hash);
        if (rows.length === 1) {
            const lotInfo = {
                id, hash,
            };
            const token = await lotToken.generateToken(lotInfo);
            res.clearCookie('lotToken');
            res.cookie("lotToken", token);
            return res.status(202)
                .json({status:'success', data:token});
        } else {
            res.clearCookie('lotToken');
            return res.status(404)
                .json({status:'failed', data: 'Unable to find parking lot in database'});
        }
    } catch (err) {
        res.clearCookie('lotToken');
        return res.status(500)
            .json({err, status:'failed', data: 'Unable to make request to server'});
    }
});

module.exports = router;
