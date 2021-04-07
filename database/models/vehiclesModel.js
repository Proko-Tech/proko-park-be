const db = require('../dbConfig');

/**
 * getting vehicles from user_id joining from vehicle_ownership
 * @param user_id
 * @returns {Promise<void>}
 */
async function getByUserId(user_id){
    const results = await db('vehicles')
        .join('vehicle_ownership', 'vehicles.id', 'vehicle_ownership.vehicle_id')
        .where({user_id})
        .select([
            'vehicles.id',
            'vehicles.license_plate',
            'vehicles.brand',
            'vehicles.make',
            'vehicles.model',
            'vehicles.color',
            'vehicle_ownership.is_primary_owner',
        ]);
    return results;
}

/**
 * get vehicles by id
 * @param id
 * @returns {Promise<void>}
 */
async function getById(id){
    const result = await db('vehicles')
        .where({id})
        .select('*');
    return result;
}

/**
 * insert vehicle with primary owner, also inserting vehicle ownership
 * @param vehicle
 * @param uid
 * @returns {Promise<void>}
 */
async function insertPrimaryOwner(vehicle, uid) {
    await db.transaction(async (transaction) => {
        try {
            const id = await db('vehicles')
                .transacting(transaction)
                .insert(vehicle)
                .returning('id');
            const vehicle_ownership = {
                vehicle_id: id, user_id: uid, is_primary_owner: true, status: 'ACCEPTED',
            };
            await db('vehicle_ownership').insert(vehicle_ownership).transacting(transaction);
            await transaction.commit();
        } catch (err) {
            console.log(err);
            await transaction.rollback();
        }
    });
}

module.exports={getByUserId, getById, insertPrimaryOwner}
