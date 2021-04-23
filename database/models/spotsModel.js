const db = require('../dbConfig');

/**
 * update spots in the array to the updated status
 * @param spot_infos
 * @returns {Promise<{spot_status: string}>}
 */
async function updateSpotStatus(spot_info){
    try {
        await db('spots')
            .where({secret: spot_info.secret})
            .andWhere({lot_id: spot_info.lot_id})
            .update(spot_info);
        return {spot_status:'success'};
    } catch (err) {
        return {spot_status:'failed'};
    }
}

/**
 * getting the spots by lot id.
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getSpotsByLotId(lot_id){
    const result = await db('spots')
        .where({lot_id})
        .select('*');
    return result;
}

/**
 * get unoccupied spots by lot id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getUnoccupiedByLotId(lot_id){
    const result = await db('spots')
        .where({lot_id})
        .andWhere({status: 'UNOCCUPIED'})
        .select('*');
    return result;
}

/**
 * Getting unoccupied spots by Lot id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getUnoccupiedByLotId(lot_id){
    const result = await db('spots')
        .where({lot_id})
        .andWhere({spot_status: 'UNOCCUPIED'})
        .select('*');
    return result;
}

/**
 * Getting unoccupied spots by Lot id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getUnoccupiedElectricByLotId(lot_id){
    const result = await db('spots')
        .where({lot_id})
        .andWhere({spot_status: 'UNOCCUPIED'})
        .andWhere({is_charging_station: true})
        .select('*');
    return result;
}

/**
 * Getting unoccupied spots by Lot id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getUnoccupiedAndNotElectricByLotId(lot_id){
    const result = await db('spots')
        .where({lot_id})
        .andWhere({spot_status: 'UNOCCUPIED'})
        .andWhere({is_charging_station: false})
        .select('*');
    return result;
}

/**
 * get spots by id
 * @param id
 * @returns {Promise<void>}
 */
async function getById(id){
    const result = await db('spots')
        .where({id})
        .select('*');
    return result;
}

/**
 * get spots by hash
 * @param spot_status
 * @returns {Promise<void>}
 */
async function getBySecret(secret){
    const result = await db('spots')
        .where({secret})
        .select('*');
    return result;
}

module.exports={updateSpotStatus, getSpotsByLotId, getUnoccupiedByLotId, getById, getBySecret, getUnoccupiedByLotId, getUnoccupiedElectricByLotId, getUnoccupiedAndNotElectricByLotId};
