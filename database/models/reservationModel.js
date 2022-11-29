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
async function getById(id) {
    const rows = await db('reservations').where({id}).select('*');
    return rows;
}

/**
 * get canceled reservations after a date and user id
 * @param reserved_at
 * @returns {Promise<void>}
 */
async function getCanceledAfterDateAndUid(user_id, reserved_at) {
    const rows = await db('reservations')
        .where('reserved_at', '>=', reserved_at)
        .andWhere({status: 'CANCELED'})
        .andWhere({user_id})
        .select('*');
    return rows;
}

/**
 * get by user id
 * @param user_id
 * @returns {Promise<void>}
 */
async function getWithLotByUserId(user_id) {
    const rows = await db('reservations')
        .join('lots', 'reservations.lot_id', 'lots.id')
        .where({user_id})
        .orderBy('reserved_at', 'asc')
        .select('*');
    return rows;
}

/**
 * update reservation to cancel and spots by id
 * @param id
 * @param stripe_chard_id
 * @returns {Promise<{reservation_status: string}>}
 */
async function updateCancelById(id, updateBody) {
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
async function getWithVehicleAndLotByUserId(user_id) {
    const rows = await db('reservations')
        .join('lots', 'reservations.lot_id', 'lots.id')
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
async function getDistinctLotsByUserId(user_id) {
    const rows = await db('reservations')
        .join('lots', 'reservations.lot_id', 'lots.id')
        .where({user_id})
        .distinct([
            'lot_id',
            'reserved_at',
            'arrived_at',
            'exited_at',
            'name',
            'lat',
            'long',
            'address',
            'state',
            'city',
            'zip',
            'alive_status',
            'price_per_hour',
        ]);
    const result = await Promise.all(
        rows.map(async (row) => {
            const spots = await spotModel.getUnoccupiedByLotId(row.lot_id);
            const electric_spots = await spotModel.getUnoccupiedElectricByLotId(
                row.lot_id,
            );
            const reservable_spots =
                await spotModel.getUnoccupiedReservableByLotId(row.lot_id);
            const lot_info = {
                ...row,
                available_spots: spots.length,
                available_electric_spots: electric_spots.length,
                available_reservable_spots: reservable_spots.length,
                available_non_reservable_spots:
                    spots.length - reservable_spots.length,
            };
            return lot_info;
        }),
    );
    const reducedArr = removeDuplicates(result, ['lot_id']);
    return reducedArr;
}

/**
 * get by user id and lot id
 * @param user_id
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getByUserIdAndLotId(user_id, lot_id) {
    const rows = await db('reservations')
        .where({user_id})
        .andWhere({lot_id})
        .select('*');
    return rows;
}

/**
 * Get reserved or arrived or parked tasks by user id.
 * @param user_id
 * @returns {Promise<awaited Knex.QueryBuilder<TRecord, ArrayIfAlready<TResult, DeferredKeySelection<TRecord, string>>>>}
 */
async function getReservedOrArrivedOrParkedByUserId(user_id) {
    const rows = await db('reservations')
        .where({user_id})
        .andWhere(function() {
            this.where('status', 'RESERVED')
                .orWhere('status', 'ARRIVED')
                .orWhere('status', 'PARKED')
        })
        .select('*');
    return rows;
}

/**
 * get reserved by spot hash and lot id
 * @param spot_hash
 * @param lot_id
 * @returns {Promise<*>}
 */
async function getReservedBySpotHashAndLotId(spot_hash, lot_id) {
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
async function getReservedByUserIdAndLotId(user_id, lot_id) {
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
async function getArrivedByUserIdAndLotId(user_id, lot_id) {
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
async function getParkedByUserIdAndLotId(user_id, lot_id) {
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
async function getArrivedBySpotHashAndLotId(spot_hash, lot_id) {
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
async function getParkedBySpotHashAndLotId(spot_hash, lot_id) {
    const rows = await db('reservations')
        .where({spot_hash})
        .andWhere({lot_id})
        .andWhere({status: 'PARKED'})
        .select('*');
    return rows;
}

/**
 * get fulfilled by spot hash and lot id
 * @param spot_hash
 * @param lot_id
 * @returns {Promise<void>}
 */
async function getFulfilledBySpotHashAndLotId(spot_hash, lot_id) {
    const rows = await db('reservations')
        .where({spot_hash})
        .andWhere({lot_id})
        .andWhere({status: 'FULFILLED'})
        .select('*');
    return rows;
}

/**
 * update the reservation info by id
 * @param id
 * @param reservation_info
 * @returns {Promise<{reservation_status: string}>}
 */
async function updateById(id, reservation_info) {
    try {
        await db('reservations').where({id}).update(reservation_info);
        return {reservation_status: 'success'};
    } catch (err) {
        return {reservation_status: 'failed'};
    }
}

/**
 * check empty spots in the requested parking lot, randomly choose index from
 * the empty spots, mark reserve then insert new reservation record. for non
 * electric spots.
 *
 * @param lot_id
 * @param user_id
 * @param vehicle_id
 * @returns {Promise<{reservation_status: string}>}
 */
async function insertAndHandleNonElectricReserve(
    lot_id,
    user_id,
    vehicle_id,
    card_id,
) {
    const result = {reservation_status: 'failed'};

    await db.transaction(async (transaction) => {
        try {
            const reserved_at = DateTime.local()
                .toUTC()
                .toSQL({includeOffset: false});
            const emptySpots =
                await spotModel.getUnoccupiedNotElectricAndReservableByLotId(
                    lot_id,
                );
            if (emptySpots.length === 0) await transaction.rollback();
            const props = ['secret', 'lot_id'];
            const spotInfo = {
                ...pick(
                    emptySpots[
                        Math.floor(
                            Math.random() * Math.floor(emptySpots.length),
                        )
                    ],
                    props,
                ),
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
                user_id,
                lot_id,
                vehicle_id,
                card_id,
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
async function insertAndHandleFCFSNonElectricArrive(lot_id, user_id) {
    const result = {reservation_status: 'failed'};
    await db.transaction(async (transaction) => {
        try {
            const reserved_at = DateTime.local()
                .toUTC()
                .toSQL({includeOffset: false});
            const emptySpots = await spotModel.getUnoccupiedNotElectricByLotId(
                lot_id,
            );
            if (emptySpots.length === 0) await transaction.rollback();
            const props = ['secret', 'lot_id'];
            const spotInfo = {
                ...pick(
                    emptySpots[
                        Math.floor(
                            Math.random() * Math.floor(emptySpots.length),
                        )
                    ],
                    props,
                ),
            };
            await db('spots')
                .where({lot_id})
                .andWhere({secret: spotInfo.secret})
                .update({spot_status: 'RESERVED'})
                .transacting(transaction);
            const reservationInfo = {
                user_id,
                lot_id,
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

/**
 * Get reservation by spot's public key join spots and lots.
 * @param public_key
 * @returns {Promise<awaited Knex.QueryBuilder<TRecord, ArrayIfAlready<TResult, DeferredKeySelection.Augment<UnwrapArrayMember<TResult>, Knex.ResolveTableType<TRecord>, IncompatibleToAlt<ArrayMember<[string, string, string, string]>, string, never>, Knex.IntersectAliases<[string, string, string, string]>>>>>}
 */
async function getBySpotPublicKeyJoinSpotsAndLots(public_key) {
    const result = await db('spots')
        .where({public_key})
        .join('lots', 'lots.id', 'spots.lot_id')
        .join('reservations', 'spots.secret', 'reservations.spot_hash')
        .select('*', 'spots.id as spot_id', 'lots.id as lot_id', 'reservations.id as reservation_id')
        .orderBy('reservations.created_at', 'DESC')
        .limit(1);
    return result;
}

/**
 * Update reservation by id and update spot status.
 * @param id
 * @param payload
 * @returns {Promise<{reservation_status: string}>}
 */
async function updateByIdAndHandleSpotStatus(id, payload, spot_payload) {
    const result = {reservation_status: 'failed'};
    await db.transaction(async (transaction) => {
        try {
            const reservation = await db('reservations')
                .select('*')
                .where({id});
            await db('reservations')
                .update(payload)
                .where({id})
                .transacting(transaction);
            await db('spots')
                .update(spot_payload)
                .where({secret: reservation[0].spot_hash})
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

module.exports = {
    getById,
    getWithLotByUserId,
    getCanceledAfterDateAndUid,
    updateCancelById,
    getDistinctLotsByUserId,
    getByUserIdAndLotId,
    getReservedBySpotHashAndLotId,
    getArrivedByUserIdAndLotId,
    getParkedByUserIdAndLotId,
    getParkedBySpotHashAndLotId,
    getFulfilledBySpotHashAndLotId,
    getReservedByUserIdAndLotId,
    getArrivedBySpotHashAndLotId,
    updateById,
    insertAndHandleNonElectricReserve,
    insertAndHandleFCFSNonElectricArrive,
    getBySpotPublicKeyJoinSpotsAndLots,
    updateByIdAndHandleSpotStatus,
    getReservedOrArrivedOrParkedByUserId,
};
