exports.up = function(knex) {
    return knex.schema.table('spots', (tbl)=>{
        tbl.decimal('last_distance');
        tbl.boolean('cam_alive_status');
    });
};

exports.down = function(knex) {
    return knex.schema.table('spots', (tbl)=>{
        tbl.dropColumn('last_distance');
        tbl.dropColumn('cam_alive_status');
    });
};
