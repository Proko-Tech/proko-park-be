const db = require('../dbConfig');

/**
 * get vehicle ownership by id and vehicle id
 * @param user_id
 * @param vehicle_id
 * @returns {Promise<void>}
 */
async function getByUserIdAndVehicleId(user_id, vehicle_id) {
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
async function getByVehicleIdJoinUser(vehicle_id) {
    const result = await db('vehicle_ownership')
        .join('users', 'users.id', 'vehicle_ownership.user_id')
        .where({vehicle_id})
        .select(
            'users.email',
            'users.first_name',
            'users.last_name',
            'users.is_verified',
            'vehicle_ownership.*',
        );
    return result;
}

/**
 * get vehicle ownership and users joined table
 * @param vehicleIds
 * @returns {Promise<void>}
 */
async function getOwnershipJoinUser(vehicleIds) {
    const result = await db('vehicle_ownership')
        .join('users', 'vehicle_ownership.user_id', 'users.id')
        .select('vehicle_ownership.user_id', 'users.id', 'email', 'is_primary_owner', 'vehicle_id')
        .whereIn('vehicle_id', vehicleIds);
    return result;
}

/**
 * insert new record
 * @param insertJson
 * @returns {Promise<{status: string}>}
 */
async function insert(insertJson) {
    await db('vehicle_ownership').insert(insertJson);
}

/**
 * update ownership by id
 * @param id
 * @param updateJson
 * @returns {Promise<void>}
 */
async function updateById(id, updateJson) {
    await db('vehicle_ownership').update(updateJson).where({id});
}

/**
 * Get ownership by id
 * @param id
 * @returns {Promise<void>}
 */
async function getById(id) {
    const result = await db('vehicle_ownership').select('*').where({id});
    return result;
}

/**
 * Get ownership by id
 * @param id
 * @returns {Promise<void>}
 */
async function getByUserId(user_id) {
    const result = await db('vehicle_ownership').select('*').where({user_id});
    return result;
}
 
/**
 * Delete ownership by id
 * @param id
 * @returns {Promise<void>}
 */
async function deleteById(id) {
    await db('vehicle_ownership').where({id}).del();
}

/**
 * Delete ownership by user id
 * @param id
 * @returns {Promise<void>}
 */
async function deleteByUserId(user_id) {
    await db('vehicle_ownership').where({user_id}).del();
}

/**
 * Inserts new ownership records
 * @param assignToUsers
 * @returns {Promise<void>}
 */  
async function batchInsertOwnership(assignToUsers) {
    await db('vehicle_ownership').insert(assignToUsers)
}

/**
 * Updates new ownership record
 * @param row
 * @param ownership
 * @returns {Promise<void>}
 */ 
async function updateByUserIdAndVehicleId(row, ownership) {
    await db('vehicle_ownership').where({user_id: row.user_id, vehicle_id: row.vehicle_id}).update(ownership)
}

module.exports = {
    getByUserIdAndVehicleId,
    getByVehicleIdJoinUser,
    insert,
    updateById,
    getById,
    getByUserId,
    deleteById,
    deleteByUserId,
    batchInsertOwnership,
    updateByUserIdAndVehicleId,
    getOwnershipJoinUser,
};
