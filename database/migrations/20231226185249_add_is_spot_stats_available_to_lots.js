exports.up = function(knex) {
    return knex.schema.table('lots', (tbl) => {
        tbl.boolean('is_spot_stats_available').defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('lots', (tbl) => {
        tbl.dropColumn('is_spot_stats_available');
    });
};
