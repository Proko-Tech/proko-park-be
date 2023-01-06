
exports.up = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.text('image_url');
    });
};

exports.down = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.dropColumn('image_url');
    });
};
