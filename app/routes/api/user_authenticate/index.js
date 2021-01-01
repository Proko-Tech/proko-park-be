const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');

const usersModel = require('../../../../database/models/usersModel');
const tokenUtil = require('../../../auth/users/tokenUtil');

const pick = require('../../../../utils/pick');

router.post('/', async function(req, res){
    const {userData} = req.body;
    const result = await usersModel.getByEmail(userData.email);

    const isUserExist = !(result.length === 0);
    const isUserTypeService = isUserExist? result[0].sign_up_type !=='NATIVE' : false;
    const isCorrectPassword = isUserExist ?
        bcrypt.compareSync(userData.password, result[0].password) : false;
    const isUserMatched = isUserExist && (isUserTypeService||isCorrectPassword);

    if (isUserMatched){
        const userInfo = {
            ...pick(result[0], ['id', 'email']),
        };
        const token = await tokenUtil.generateToken(userInfo);
        res.status(202)
            .json({status:'success', data:token});
    } else {
        res.status(404).json({status:'failed', message: 'email/password incorrect'});
    }
});

module.exports = router;
