const express = require('express');
const router = express.Router();

const vehiclesModel = require('../../../../database/models/vehiclesModel');

router.post('/', async function(req, res){
    const {id} = req.userInfo;
    try {
        await vehiclesModel.insertPrimaryOwner(req.body, id);
        res.status(200).json({status: 'success', message: 'Successfully inserted vehicle'});
    } catch (err){
        res.status(500)
            .json({err, message: 'Unable to insert vehicle due to server errors'})
    }
});

module.exports = router;
