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
 * Delete ownership by id
 * @param id
 * @returns {Promise<void>}
 */
async function deleteById(id) {
    await db('vehicle_ownership').where({id}).del();
}

/**
 * Get all co-owned vehicles by user id
 * @param id 
 * @returns  {Promise<void>}
 */
async function getCoOwnedByUserId(id) {
    const result = await db('vehicle_ownership').select('*').where({user_id: id, is_primary_owner: 0})
    return result;
}

/**
 * Deletes all co-owned vehicles by user id
 * @param id 
 * @returns  {Promise<void>}
 */
async function deleteCoOwnedByUserId(id) {
    const result = await db('vehicle_ownership').where({user_id: id, is_primary_owner: 0}).del()
    return result;
}

/**
 * delete vehicle & ownership information by a list of ...
 * @param 
 * @returns {Promise<void>}
 */  
 async function batchTransferOwnership(assignToUsers, id) {
    // await db('vehicle_ownership').where({user_id: id, is_primary_owner: 0}).del() // Delete ownership record of user to be deleted
    const result = await db('vehicle_ownership').insert(assignToUsers)
    return result
}

module.exports = {
    getByUserIdAndVehicleId,
    getByVehicleIdJoinUser,
    insert,
    updateById,
    getById,
    deleteById,
    getCoOwnedByUserId,
    deleteCoOwnedByUserId,
    batchTransferOwnership
};
