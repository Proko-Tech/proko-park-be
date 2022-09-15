const db = require('../dbConfig');

/**
 * getting vehicles from user_id joining from vehicle_ownership
 * @param user_id
 * @returns {Promise<void>}
 */
async function getByUserId(user_id) {
    const results = await db('vehicles')
        .join(
            'vehicle_ownership',
            'vehicles.id',
            'vehicle_ownership.vehicle_id',
        )
        .where({user_id})
        .select([
            'vehicles.id',
            'vehicles.license_plate',
            'vehicles.brand',
            'vehicles.make',
            'vehicles.model',
            'vehicles.color',
            'vehicles.license_issued_state',
            'vehicle_ownership.is_primary_owner',
            'vehicle_ownership.status',
        ]);
    return results;
}

/**
 * get vehicles by id
 * @param id
 * @returns {Promise<void>}
 */
async function getById(id) {
    const result = await db('vehicles').where({id}).select('*');
    return result;
}

/**
 * get vehicles by issued state and license plate
 * @param license_issued_state
 * @param license_plate
 * @returns {Promise<void>}
 */
async function getByIssuedStateAndLicensePlate(
    license_issued_state,
    license_plate,
) {
    const result = await db('vehicles')
        .where({license_issued_state})
        .andWhere({license_plate})
        .select('*');
    return result;
}

/**
 *
 * @param id
 * @param updated_json
 * @returns {Promise<void>}
 */
async function updateById(id, updated_json) {
    await db('vehicles').where({id}).update(updated_json);
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
                vehicle_id: id,
                user_id: uid,
                is_primary_owner: true,
                status: 'ACCEPTED',
            };
            await db('vehicle_ownership')
                .insert(vehicle_ownership)
                .transacting(transaction);
            await transaction.commit();
        } catch (err) {
            console.log(err);
            await transaction.rollback();
        }
    });
}

/**
 * delete vehicle & ownership information by vehicle id
 * @param id
 * @returns {Promise<void>}
 */
async function deleteByIdTransactOwnership(id) {
    await db.transaction(async (transaction) => {
        try {
            await db('vehicles').transacting(transaction).where({id}).del();
            await db('vehicle_ownership')
                .where({vehicle_id: id})
                .del()
                .transacting(transaction);
            await transaction.commit();
        } catch (err) {
            console.log(err);
            await transaction.rollback();
        }
    });
}

/**
 * batch delete vehicle information by a list of vehicle IDs
 * @param idList
 * @returns {Promise<void>}
 */
async function batchDeleteById(idList) {
    await db('vehicles').whereIn('id', idList).del();
}

module.exports = {
    getByUserId,
    getById,
    getByIssuedStateAndLicensePlate,
    updateById,
    insertPrimaryOwner,
    deleteByIdTransactOwnership,
    batchDeleteById,
};
