const db = require('../dbConfig');
const {DateTime} = require('luxon');

const spotsModel = require('./spotsModel');

/**
 * Gets parking lot from db by id and hash key
 * @param id
 * @param hash
 * @returns {Promise<void>}
 */
async function getByIdAndHash(id, hash) {
    const result = await db('lots').where({id}).andWhere({hash}).select('*');
    return result;
}

/**
 * Update lot to alive based on id and hash
 * @param lot_info
 * @returns {Promise<{lot_status: string}>}
 */
async function markLotAliveStatusByIdAndHash(lot_info) {
    try {
        const date = DateTime.local().toUTC().toSQL({includeOffset: false});
        await db('lots')
            .where({hash: lot_info.hash})
            .andWhere({id: lot_info.id})
            .update({alive_status: true, updated_at: date});
        return {lot_status: 'success'};
    } catch (err) {
        return {lot_status: 'failed'};
    }
}

/**
 * get lot and spots json by hash
 * @param hash
 * @returns {Promise<void>}
 */
async function getLotAndSpotsByHash(hash) {
    const result = await db('lots').where({hash}).select('*');
    result[0].spots = await spotsModel.getSpotsByLotId(result[0].id);
    return result[0];
}

/**
 * get parking lot and its open spots with parameter
 * @param id
 * @returns {Promise<{available_spots: *}>}
 */
async function getAndUnoccupiedSpotNumsById(id) {
    const lot = await db('lots').where({id}).select('*');
    if (lot.length > 0) {
        const spots = await spotsModel.getUnoccupiedByLotId(lot[0].id);
        const result = {
            ...lot[0],
            available_spots: spots.length,
        };
        return result;
    } else {
        return null;
    }
}

/**
 * get parking lot and its open spots with parameter
 * @param id
 * @returns {Promise<{available_spots: *}>}
 */
async function getAndUnoccupiedElectricSpotNumsById(id) {
    const lot = await db('lots').where({id}).select('*');
    if (lot.length > 0) {
        const spots = await spotsModel.getUnoccupiedElectricByLotId(lot[0].id);
        const result = {
            ...lot[0],
            available_spots: spots.length,
        };
        return result;
    } else {
        return null;
    }
}

/**
 * get reservable spot numbers by id
 * @param id
 * @returns {Promise<null|{available_spots: *}>}
 */
async function getAndReservableSpotNumsById(id) {
    const lot = await db('lots').where({id}).select('*');
    if (lot.length > 0) {
        const spots = await spotsModel.getUnoccupiedReservableByLotId(
            lot[0].id,
        );
        return spots.length;
    } else {
        return null;
    }
}

/**
 * get non-reservable spot numbers by id
 * @param id
 * @returns {Promise<null|{available_spots: *}>}
 */
async function getAndNonReservableSpotNumsById(id) {
    const lot = await db('lots').where({id}).select('*');
    if (lot.length > 0) {
        const spots = await spotsModel.getUnoccupiedNonReservableByLotId(
            lot[0].id,
        );
        return spots.length;
    } else {
        return null;
    }
}

/**
 * get lot info by id
 * @param id
 * @returns {Promise<void>}
 */
async function getById(id) {
    const result = await db('lots').where({id}).select('*');
    return result;
}

/**
 * get closest lots by latitude and longitude
 * @param id
 * @returns {Promise<unknown[]>}
 */
async function getClosestByLatLong(lat, long) {
    const lots = await db('lots')
        .where('lat', '<=', lat + 0.02)
        .andWhere('lat', '>=', lat - 0.02)
        .andWhere('long', '<=', long + 0.02)
        .andWhere('long', '>=', long - 0.02)
        .select('*');
    const result = await Promise.all(
        lots.map(async (lot) => {
            const spots = await spotsModel.getUnoccupiedByLotId(lot.id);
            const electric_spots =
                await spotsModel.getUnoccupiedElectricByLotId(lot.id);
            const reservable_spots =
                await spotsModel.getUnoccupiedReservableByLotId(lot.id);
            const lot_info = {
                ...lot,
                available_spots: spots.length,
                available_electric_spots: electric_spots.length,
                available_reservable_spots: reservable_spots.length,
                available_non_reservable_spots:
                    spots.length - reservable_spots.length,
            };
            return lot_info;
        }),
    );
    return result;
}

/**
 * get alike name or alike address given a string payload
 * @param payload - format of: '%stringofsearch%'
 * @returns {Promise<unknown[]>}
 */
async function getByAlikeNameOrAddress(payload) {
    const lots = await db('lots')
        .whereRaw('name LIKE ?', payload)
        .orWhereRaw('address LIKE ?', payload)
        .select('*');
    const result = await Promise.all(
        lots.map(async (lot) => {
            const spots = await spotsModel.getUnoccupiedByLotId(lot.id);
            const electric_spots =
                await spotsModel.getUnoccupiedElectricByLotId(lot.id);
            const reservable_spots =
                await spotsModel.getUnoccupiedReservableByLotId(lot.id);
            const lot_info = {
                ...lot,
                available_spots: spots.length,
                available_electric_spots: electric_spots.length,
                available_reservable_spots: reservable_spots.length,
                available_non_reservable_spots:
                    spots.length - reservable_spots.length,
            };
            return lot_info;
        }),
    );
    return result;
}

module.exports = {
    getByIdAndHash,
    markLotAliveStatusByIdAndHash,
    getLotAndSpotsByHash,
    getAndUnoccupiedSpotNumsById,
    getAndUnoccupiedElectricSpotNumsById,
    getAndReservableSpotNumsById,
    getAndNonReservableSpotNumsById,
    getById,
    getClosestByLatLong,
    getByAlikeNameOrAddress,
};
