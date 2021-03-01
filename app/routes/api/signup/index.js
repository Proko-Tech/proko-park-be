const express = require('express');
const router = express.Router();

const userModel = require('../../../../database/models/usersModel');


router.post('/', async function(req, res){
    const user = req.body;
    console.log(user);
    try {
        const users = await userModel.insertUser(user);
        if (users.length!=0) {
            res.status(401)
                .json({status: 'failed', msg: 'Another account using this email was found'});
        } else {
            res.status(200)
                .json({status: 'success', message: 'success'});
        }
    } catch (err) {
        res.status(500)
            .json({err, message: 'Unable to get user from database'})
    }
});
module.exports = router;
