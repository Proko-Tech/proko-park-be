const express = require('express');
const router = express.Router();

router.get('/', async function(req, res){
    res.status(200).json({message: 'Proko Park Server alive'});
});

module.exports = router;
