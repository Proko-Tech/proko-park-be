exports.up = function(knex) {
    return knex.schema.table('lots', (tbl) => {
        tbl.text('server_url');
    });
};

exports.down = function(knex) {
    return knex.schema.table('lots', (tbl) => {
        tbl.dropColumn('server_url');
    });
};
