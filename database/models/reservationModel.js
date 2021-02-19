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
        .distinct(['lot_id', 'name', 'lat', 'long', 'address', 'state', 'city', 'zip', 'alive_status', 'price_per_hour']);
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

/**
 * get by user id and lot id
 * @param user_id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getByUserIdAndLotId(user_id, lot_id){
    const rows = await db('reservations')
        .where({user_id})
        .andWhere({lot_id})
        .select("*");
    return rows;
}

module.exports={getDistinctLotsByUserId, getByUserIdAndLotId};
