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
        .distinct(['lot_id', 'reserved_at', 'arrived_at','exited_at', 'name', 'lat', 'long', 'address', 'state', 'city', 'zip', 'alive_status', 'price_per_hour']);
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

/**
 * get reserved by spot hash and lot id
 * @param spot_hash
 * @param lot_id
 * @returns {Promise<*>}
 */
async function getReservedBySpotHashAndLotId(spot_hash, lot_id){
    const rows = await db('reservations')
        .where({spot_hash})
        .andWhere({lot_id})
        .andWhere({status: 'RESERVED'})
        .select('*');
    return rows;
}

/**
 * get arrived by spot hash and lot id
 * @param spot_hash
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getArrivedBySpotHashAndLotId(spot_hash, lot_id){
    const rows = await db('reservations')
        .where({spot_hash})
        .andWhere({lot_id})
        .andWhere({status: 'ARRIVED'})
        .select('*');
    return rows;
}

/**
 * get parked by spot hash and lot id
 * @param spot_hash
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getParkedBySpotHashAndLotId(spot_hash, lot_id){
    const rows = await db('reservations')
        .where({spot_hash})
        .andWhere({lot_id})
        .andWhere({status: 'PARKED'})
        .select('*');
    return rows;
}

/**
 * update the reservation info by id
 * @param id
 * @param reservation_info
 * @returns {Promise<{reservation_status: string}>}
 */
async function updateById(id, reservation_info){
    try {
        await db('reservations')
            .where({id})
            .update(reservation_info);
        return {reservation_status:'success'};
    } catch (err) {
        return {reservation_status:'failed'};
    }
}

module.exports={getDistinctLotsByUserId, getByUserIdAndLotId, getReservedBySpotHashAndLotId,getParkedBySpotHashAndLotId, getArrivedBySpotHashAndLotId, updateById};
