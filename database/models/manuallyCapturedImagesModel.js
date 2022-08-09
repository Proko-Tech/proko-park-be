const db = require('../dbConfig');
const pick = require('../../utils/pick');
const removeDuplicates = require('../../utils/removeDuplicates');
const {DateTime} = require('luxon');

/**
 * get manual capture info by id
 * @param id
 * @returns {Promise<void>}
 */
 async function getById(id) {
    const rows = await db('manually_captured_images').where({id}).select('*');
    return rows;
}

 async function getBySpotId(spot_id) {
    const rows = await db('manually_captured_images').where('spot_id', spot_id).select('*');
 }