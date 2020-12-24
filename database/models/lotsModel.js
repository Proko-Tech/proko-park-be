const db = require('../dbConfig');

const spotsModel = require('./spotsModel');

/**
 * Gets parking lot from db by id and hash key
 * @param id
 * @param hash
 * @returns {Promise<void>}
 */
async function getByIdAndHash(id, hash){
    const result = await db('lots')
        .where({id})
        .andWhere({hash})
        .select('*');
    return result;
}

/**
 * Update lot to alive based on id and hash
 * @param lot_info
 * @returns {Promise<{lot_status: string}>}
 */
async function markLotAliveStatusByIdAndHash(lot_info){
    try {
        await db('lots')
            .where({hash: lot_info.hash})
            .andWhere({id: lot_info.id})
            .update({alive_status: true});
        return {lot_status:'success'};
    } catch (err) {
        return {lot_status:'failed'};
    }
};

/**
 * get lot and spots json by hash
 * @param hash
 * @returns {Promise<void>}
 */
async function getLotAndSpotsByHash(hash){
    const result = await db('lots')
        .where({hash})
        .select('*');
    result[0].spots = await spotsModel.getSpotsByLotId(result[0].id);
    return result[0];
}

module.exports={getByIdAndHash, markLotAliveStatusByIdAndHash, getLotAndSpotsByHash};
