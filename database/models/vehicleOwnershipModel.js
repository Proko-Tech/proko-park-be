const db = require('../dbConfig');

/**
 * get vehicle ownership by id and vehicle id
 * @param user_id
 * @param vehicle_id
 * @returns {Promise<void>}
 */
async function getByUserIdAndVehicleId(user_id, vehicle_id){
    const results = await db('vehicle_ownership')
        .where({user_id})
        .andWhere({vehicle_id})
        .select('*');
    return results;
}

/**
 * get vehicle ownership information and its owners by vehicle id
 * @param vehicle_id
 * @returns {Promise<void>}
 */
async function getByVehicleIdJoinUser(vehicle_id){
    const result = await db('vehicle_ownership')
        .join('users', 'users.id', 'vehicle_ownership.user_id')
        .where({vehicle_id})
        .select('*');
    return result;
}

/**
 * insert new record
 * @param insertJson
 * @returns {Promise<{status: string}>}
 */
async function insert(insertJson) {
    await db('vehicle_ownership')
        .insert(insertJson);
}

module.exports={getByUserIdAndVehicleId, getByVehicleIdJoinUser, insert};
