
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('spots').del()
        .then(function() {
            // Inserts seed entries
            return knex('spots').insert([
                {id: 1, lot_id: 1, spot_name: 'spot1', secret:'dfjaksfsl', alive_status:true, spot_status:'RESERVED'},
                {id: 2, lot_id: 1, spot_name: 'spot2', secret:'dasfasfas', alive_status:true, spot_status:'UNOCCUPIED'},
                {id: 3, lot_id: 1, spot_name: 'spot3', secret:'afdasdfad', alive_status:true, spot_status:'UNOCCUPIED'},
                {id: 4, lot_id: 2, spot_name: 'spot4', secret:'fdasffdad', alive_status:true, spot_status:'UNOCCUPIED'},
                {id: 5, lot_id: 2, spot_name: 'spot5', secret:'fdsassdfd', alive_status:true, spot_status:'UNOCCUPIED'},
                {id: 6, lot_id: 2, spot_name: 'spot6', secret:'trewtrytc', alive_status:true, spot_status:'UNOCCUPIED'},
                {id: 7, lot_id: 1, spot_name: 'spot7', secret:'cxvbxvbbv', alive_status:true, spot_status:'UNOCCUPIED'},
                {id: 8, lot_id: 1, spot_name: 'spot8', secret:'lkhkjgjkb', alive_status:true, spot_status:'UNOCCUPIED'},
                {id: 9, lot_id: 1, spot_name: 'spot9', secret:'zxccvcxzn', alive_status:true, spot_status:'UNOCCUPIED'},
                {id: 10, lot_id: 1, spot_name: 'spot10', secret:'qweerewrd', alive_status:true, spot_status:'UNOCCUPIED'},
                {id: 11, lot_id: 1, spot_name: 'spot11', secret:'hfsdfgfdd', alive_status:true, spot_status:'UNOCCUPIED'},
                {id: 12, lot_id: 1, spot_name: 'spot12', secret:'bvcxhncxx', alive_status:true, spot_status:'UNOCCUPIED'},
            ]);
        });
};
