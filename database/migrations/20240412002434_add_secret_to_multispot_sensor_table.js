
exports.up = function(knex) {
    return knex.schema.table('multispot_sensors', (tbl) => {
        tbl.text('secret');
    });
};

exports.down = function(knex) {
    return knex.schema.table('multispot_sensors', (tbl) => {
        tbl.dropColumn('secret');
    });
};
