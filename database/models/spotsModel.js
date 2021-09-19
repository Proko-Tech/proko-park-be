const db = require('../dbConfig');
const pick = require('../../utils/pick');
const {DateTime} = require('luxon');

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
 * Getting unoccupied spots by Lot id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getUnoccupiedByLotId(lot_id){
    const result = await db('spots')
        .where({lot_id})
        .andWhere({spot_status: 'UNOCCUPIED'})
        .andWhere({alive_status: true})
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
        .andWhere({alive_status: true})
        .select('*');
    return result;
}

/**
 * Getting unoccupied and reservable spots by Lot id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getUnoccupiedReservableByLotId(lot_id){
    const result = await db('spots')
        .where({lot_id})
        .andWhere({spot_status: 'UNOCCUPIED'})
        .andWhere({is_reservable: true})
        .andWhere({alive_status: true})
        .select('*');
    return result;
}

/**
 * Getting unoccupied and non-reservable spots by Lot id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getUnoccupiedNonReservableByLotId(lot_id){
    const result = await db('spots')
        .where({lot_id})
        .andWhere({spot_status: 'UNOCCUPIED'})
        .andWhere({is_reservable: false})
        .andWhere({alive_status: true})
        .select('*');
    return result;
}

/**
 * Getting unoccupied spots by Lot id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getUnoccupiedNotElectricAndReservableByLotId(lot_id){
    const result = await db('spots')
        .where({lot_id})
        .andWhere({spot_status: 'UNOCCUPIED'})
        .andWhere({is_charging_station: false})
        .andWhere({is_reservable: true})
        .andWhere({alive_status: true})
        .select('*');
    return result;
}

/**
 * get unoccupied not electrical, and non reservable spots by lot id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getUnoccupiedNotElectricByLotId(lot_id){
    const result = await db('spots')
        .where({lot_id})
        .andWhere({spot_status: 'UNOCCUPIED'})
        .andWhere({is_charging_station: false})
        // .andWhere({is_reservable: false})
        .andWhere({alive_status: true})
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


/**
 * batch mark alive status for spots
 * @param spots
 * @returns {Promise<{spot_status: string}>}
 */
async function batchUpdate(spots){
    try {
        await spots.map(async (spot) => {
            const updated_date = DateTime.fromISO(new Date(spot.updated_at).toISOString()).toUTC().toSQL({includeOffset: false});
            const update_body = pick(spot, ['alive_status', 'firmware_version']);
            update_body.updated_at = updated_date;
            await db('spots')
                .update(update_body)
                .where({secret: spot.secret});
        });
        return {spot_status:'success'};
    } catch (err) {
        return {spot_status:'failed'};
    }
}

module.exports={updateSpotStatus, getSpotsByLotId, getUnoccupiedByLotId, getById, getBySecret, getUnoccupiedByLotId, getUnoccupiedElectricByLotId, getUnoccupiedNotElectricAndReservableByLotId, batchUpdate, getUnoccupiedReservableByLotId, getUnoccupiedNonReservableByLotId, getUnoccupiedNotElectricByLotId};
