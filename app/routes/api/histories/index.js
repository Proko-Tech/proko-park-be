const express = require('express');
const router = express.Router();

const reservationModel = require('../../../../database/models/reservationModel');

router.get('/', async function(req, res){
    try {
        const parking_histories = await reservationModel.getWithLotByUserId(req.userInfo.id);
        res.status(200).json({data:parking_histories, message: 'Parking lot histories found'});
    } catch (err) {
        res.status(500)
            .json({err, message: 'Unable to get parking lot histories from database'})
    }
});

module.exports = router;
