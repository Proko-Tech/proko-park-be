
exports.up = function(knex) {
    return knex.schema.table('reservations', (tbl)=>{
        tbl.text('exit_image_url');
    });
};

exports.down = function(knex) {
    return knex.schema.table('reservations', (tbl)=>{
        tbl.dropColumn('exit_image_url');
    });
};
