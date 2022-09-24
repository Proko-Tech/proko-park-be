
exports.up = function(knex) {
    return knex.schema.table('users', (tbl) => {
        tbl.text('refresh_token');
    });
};

exports.down = function(knex) {
    return knex.schema.table('users', (tbl) => {
        tbl.dropColumn('refresh_token');
    });
};
