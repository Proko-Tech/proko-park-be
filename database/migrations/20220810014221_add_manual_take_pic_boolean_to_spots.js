
exports.up = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.boolean('manual_capture').defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.dropColumn('manual_capture');
    });
};
