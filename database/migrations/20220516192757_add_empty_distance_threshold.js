exports.up = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.decimal('empty_distance_threshold');
    });
};

exports.down = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.dropColumn('empty_distance_threshold');
    });
};
