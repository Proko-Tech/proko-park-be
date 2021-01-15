const express = require('express');
const router = express.Router();

const userModel = require('../../../../database/models/usersModel');
const vehicleModel = require('../../../../database/models/vehiclesModel');
const reservationModel = require('../../../../database/models/reservationModel');

router.get('/parking_lot/:id', async function(req, res){
    const {id} = req.params;
    try {
        if (id === JSON.stringify(req.userInfo.id)) {
            const parking_lots = await reservationModel.getDistinctLotsByUserId(id);
            res.status(200).json({data:parking_lots, message: 'Parking lot histories found'});
        } else {
            res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
    } catch (err) {
        res.status(500)
            .json({err, message: 'Unable to get parking lot histories from database'})
    }
});

router.get('/:id', async function(req, res){
    const {id} = req.params;
    try {
        if (id === JSON.stringify(req.userInfo.id)) {
            const user = await userModel.getAllById(id);
            user.user.vehicles = await vehicleModel.getByUserId(id);
            res.status(200).json({data:user, msg: 'User info was found'});
        } else {
            res.status(401)
                .json({status: 'failed', message: 'Unauthorized action'});
        }
    } catch (err) {
        res.status(500)
            .json({err, message: 'Unable to get user from database'})
    }
});

module.exports = router;
