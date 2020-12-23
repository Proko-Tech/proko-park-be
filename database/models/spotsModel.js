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

module.exports={updateSpotStatus};
