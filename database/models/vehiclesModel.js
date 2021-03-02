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

module.exports={getByUserId, getById};
