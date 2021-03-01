const db = require('../dbConfig');

async function getByUserIdAndVehicleId(user_id, vehicle_id){
    const results = await db('vehicle_ownership')
        .where({user_id})
        .andWhere({vehicle_id})
        .select('*');
    return results;
}

module.exports={getByUserIdAndVehicleId};
