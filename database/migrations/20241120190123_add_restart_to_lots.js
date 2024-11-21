exports.up = function(knex) {
    return knex.schema.table('lots', (tbl) => {
        tbl.boolean('restart_server').default(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('lots', (tbl) => {
        tbl.dropColumn('restart_server');
    });
};
