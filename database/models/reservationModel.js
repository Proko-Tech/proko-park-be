const db = require('../dbConfig');

/**
 * get distinct lot information from user parking histories
 * @param user_id
 * @returns {Promise<void>}
 */
async function getDistinctLotsByUserId(user_id){
    const result = await db('reservations')
        .join('lots', 'reservations.lot_id', 'lots.id')
        .where({user_id})
        .distinct(['lot_id', 'name', 'lat', 'long', 'address', 'state', 'city', 'zip']);
    return result;
}

module.exports={getDistinctLotsByUserId}
