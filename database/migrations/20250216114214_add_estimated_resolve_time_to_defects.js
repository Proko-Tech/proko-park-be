exports.up = function(knex) {
    return knex.schema.table('defects', (tbl) => {
        tbl.datetime('estimated_resolve_time');
    });
};

exports.down = function(knex) {
    return knex.schema.table('defects', (tbl) => {
        tbl.dropColumn('estimated_resolve_time');
    });
};
