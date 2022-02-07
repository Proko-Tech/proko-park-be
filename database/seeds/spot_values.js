
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('spots').del()
        .then(function() {
            // Inserts seed entries
            return knex('spots').insert([
                {id: 1, lot_id: 1, spot_name: 'spot4', secret:'A0:20:A6:17:89:D6', alive_status:true, spot_status:'UNOCCUPIED'},
                {id: 2, lot_id: 1, spot_name: 'spot5', secret:'84:CC:A8:B0:23:E9', alive_status:true, spot_status:'UNOCCUPIED'},
                {id: 3, lot_id: 1, spot_name: 'spot6', secret:'84:CC:A8:AE:8F:0B', alive_status:true, spot_status:'UNOCCUPIED'},
            ]);
        });
};
