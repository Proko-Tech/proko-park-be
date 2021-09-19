const db = require('../dbConfig');
const spotModel = require('./spotsModel');
const pick = require('../../utils/pick');
const removeDuplicates = require('../../utils/removeDuplicates');
const {DateTime} = require('luxon');

/**
 * get reservation by id
 * @param id
 * @returns {Promise<void>}
 */
async function getById(id){
    const rows = await db('reservations')
        .where({id})
        .select('*');
    return rows;
}

/**
 * get canceled reservations after a date and user id
 * @param reserved_at
 * @returns {Promise<void>}
 */
async function getCanceledAfterDateAndUid(user_id, reserved_at){
    const rows = await db('reservations')
        .where('reserved_at', '>=', reserved_at)
        .andWhere({status: 'CANCELED'})
        .andWhere({user_id})
        .select('*');
    return rows;
};

/**
 * get by user id
 * @param user_id
 * @returns {Promise<void>}
 */
async function getWithLotByUserId(user_id){
    const rows = await db('reservations')
        .join('lots','reservations.lot_id', 'lots.id')
        .where({user_id})
        .select('*');
    return rows;
}

/**
 * update reservation to cancel and spots by id
 * @param id
 * @param stripe_chard_id
 * @returns {Promise<{reservation_status: string}>}
 */
async function updateCancelById(id, updateBody){
    const result = {reservation_status: 'failed'};
    await db.transaction(async (transaction) => {
        try {
            await db('reservations')
                .update(updateBody)
                .where({id})
                .transacting(transaction);
            const reservation = await db('reservations')
                .where({id})
                .select('*');
            await db('spots')
                .update({spot_status: 'UNOCCUPIED'})
                .where({secret: reservation[0].spot_hash})
                .andWhere({lot_id: reservation[0].lot_id})
                .transacting(transaction);
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
        const electric_spots = await spotModel.getUnoccupiedElectricByLotId(row.lot_id);
        const reservable_spots = await spotModel.getUnoccupiedReservableByLotId(row.lot_id);
        const lot_info = {
            ...row,
            available_spots: spots.length,
            available_electric_spots: electric_spots.length,
            available_reservable_spots: reservable_spots.length,
            available_non_reservable_spots: spots.length ,
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
 * empty spots, mark reserve then insert new reservation record. for non electric
 * spots
 *
 * @param lot_id
 * @param user_id
 * @param vehicle_id
 * @returns {Promise<{reservation_status: string}>}
 */
async function insertAndHandleNonElectricReserve(lot_id, user_id, vehicle_id, card_id){
    const result = {reservation_status: 'failed'};

    await db.transaction(async (transaction) => {
        try {
            const reserved_at = DateTime.local().toUTC().toSQL({includeOffset:false});
            const emptySpots = await spotModel.getUnoccupiedNotElectricAndReservableByLotId(lot_id);
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
            const vehicle = await db('vehicles')
                .where({id: vehicle_id})
                .select('*');
            const reservationInfo = {
                user_id, lot_id, vehicle_id, card_id,
                license_plate: vehicle[0].license_plate,
                spot_hash: spotInfo.secret,
                reserved_at,
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

/**
 * insert and handle first come first serve non-electrical reserve
 * @param lot_id
 * @param user_id
 * @returns {Promise<{reservation_status: string}>}
 */
async function insertAndHandleFCFSNonElectricArrive(lot_id, user_id){
    const result = {reservation_status: 'failed'};
    await db.transaction(async (transaction) => {
        try {
            const reserved_at = DateTime.local().toUTC().toSQL({includeOffset: false});
            const emptySpots = await spotModel.getUnoccupiedNotElectricByLotId(lot_id);
            if (emptySpots.length === 0) await transaction.rollback();
            const props = ['secret', 'lot_id'];
            const spotInfo = {
                ...pick(emptySpots[Math.floor(Math.random() * Math.floor(emptySpots.length))], props),
            };
            await db('spots')
                .where({lot_id})
                .andWhere({secret: spotInfo.secret})
                .update({spot_status: 'RESERVED'})
                .transacting(transaction);
            const reservationInfo = {
                user_id, lot_id,
                license_plate: 'First Come First Serve',
                vehicle_id: -1,
                spot_hash: spotInfo.secret,
                reserved_at,
                arrived_at: reserved_at,
                status: 'ARRIVED',
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

module.exports={getById, getWithLotByUserId, getCanceledAfterDateAndUid, updateCancelById, getDistinctLotsByUserId, getByUserIdAndLotId, getReservedBySpotHashAndLotId, getWithVehicleAndLotByUserId, getReservedByUserId, getArrivedByUserId, getParkedByUserId, getArrivedByUserIdAndLotId, getParkedByUserIdAndLotId, getParkedBySpotHashAndLotId, getReservedByUserIdAndLotId, getArrivedBySpotHashAndLotId, updateById, insertAndHandleNonElectricReserve, insertAndHandleFCFSNonElectricArrive};
