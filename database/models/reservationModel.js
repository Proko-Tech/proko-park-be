const db = require('../dbConfig');
const spotModel = require('./spotsModel');

/**
 * get distinct lot information from user parking histories
 * @param user_id
 * @returns {Promise<unknown[]>}
 */
async function getDistinctLotsByUserId(user_id){
    const rows = await db('reservations')
        .join('lots', 'reservations.lot_id', 'lots.id')
        .where({user_id})
        .distinct(['lot_id', 'name', 'lat', 'long', 'address', 'state', 'city', 'zip']);
    const result = await Promise.all(rows.map(async (row)=>{
        const spots = await spotModel.getUnoccupiedByLotId(row.lot_id);
        const lot_info = {
            ...row,
            available_spots: spots.length,
        };
        return lot_info;
    }));
    return result;
}

module.exports={getDistinctLotsByUserId};
