const db = require('../dbConfig');
const spotModel = require('./spotsModel');
const pick = require('../../utils/pick');
const removeDuplicates = require('../../utils/removeDuplicates');


/**
 * get with vehicle, and lot info by user id
 * @param user_id
 * @returns {Promise<void>}
 */
async function getWithVehicleAndLotByUserId(user_id){
    const rows = await db('reservations')
        .join('lots','reservations.lot_id', 'lots.id')
        .join('vehicles', 'reservations.vehicle_id', 'vehicles.id')
        .where({user_id})
        .select('*');
    return rows;
}

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
    const reducedArr = removeDuplicates(result, ['lot_id']);
    return reducedArr;
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
 * get reserved tasks by user Id
 * @param user_id
 * @returns {Promise<void>}
 */
async function getReservedByUserId(user_id){
    const rows = await db('reservations')
        .where({user_id})
        .andWhere({status: 'RESERVED'})
        .select('*');
    return rows;
}

/**
 * get arrived tasks by user Id
 * @param user_id
 * @returns {Promise<void>}
 */
async function getArrivedByUserId(user_id){
    const rows = await db('reservations')
        .where({user_id})
        .andWhere({status: 'ARRIVED'})
        .select('*');
    return rows;
}

/**
 * get parked tasks by user Id
 * @param user_id
 * @returns {Promise<void>}
 */
async function getParkedByUserId(user_id){
    const rows = await db('reservations')
        .where({user_id})
        .andWhere({status: 'PARKED'})
        .select('*');
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
 * get reserved by user id and lot id
 * @param user_id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getReservedByUserIdAndLotId(user_id, lot_id){
    const rows = await db('reservations')
        .where({user_id})
        .andWhere({lot_id})
        .andWhere({status: 'RESERVED'})
        .select('*');
    return rows;
}

/**
 * get arrived by user id and lot id
 * @param user_id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getArrivedByUserIdAndLotId(user_id, lot_id){
    const rows = await db('reservations')
        .where({user_id})
        .andWhere({lot_id})
        .andWhere({status: 'ARRIVED'})
        .select('*');
    return rows;
}

/**
 * get parked by user id and lot id
 * @param user_id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getParkedByUserIdAndLotId(user_id, lot_id){
    const rows = await db('reservations')
        .where({user_id})
        .andWhere({lot_id})
        .andWhere({status: 'PARKED'})
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

/**
 * check empty spots in the requested parking lot, randomly choose index from the
 * empty spots, mark reserve then insert new reservation record.
 *
 * @param lot_id
 * @param user_id
 * @param vehicle_id
 * @returns {Promise<{reservation_status: string}>}
 */
async function insertAndHandleReserve(lot_id, user_id, vehicle_id){
    const result = {reservation_status: 'failed'};
    await db.transaction(async (transaction) => {
        try {
            const emptySpots = await spotModel.getUnoccupiedByLotId(lot_id);
            if (emptySpots.length === 0) await transaction.rollback();
            const props = ['secret', 'lot_id'];
            const spotInfo = {
                ...pick(emptySpots[Math.floor(Math.random() * Math.floor(emptySpots.length))], props),
                status: 'RESERVED',
            };
            await db('spots')
                .where({lot_id})
                .andWhere({secret: spotInfo.secret})
                .update({spot_status: 'RESERVED'})
                .transacting(transaction);
            const reservationInfo = {
                user_id, lot_id, vehicle_id,
                spot_hash: spotInfo.secret,
                reserved_at: new Date(),
                status: 'RESERVED',
            };
            await db('reservations')
                .transacting(transaction)
                .insert(reservationInfo);
            result.reservation_status = 'success';
            await transaction.commit();
        } catch (err) {
            console.log(err);
            result.reservation_status = 'failed';
            await transaction.rollback();
        }
    });
    return result;
}

module.exports={getDistinctLotsByUserId, getByUserIdAndLotId, getReservedBySpotHashAndLotId, getWithVehicleAndLotByUserId, getReservedByUserId, getArrivedByUserId, getParkedByUserId, getArrivedByUserIdAndLotId, getParkedByUserIdAndLotId, getParkedBySpotHashAndLotId, getReservedByUserIdAndLotId, getArrivedBySpotHashAndLotId, updateById, insertAndHandleReserve};
