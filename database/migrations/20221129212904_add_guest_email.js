
exports.up = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.text('guest_email');
    });
};

exports.down = function(knex) {
    return knex.schema.table('reservations', (tbl) => {
        tbl.dropColumn('guest_email');
    });
};
