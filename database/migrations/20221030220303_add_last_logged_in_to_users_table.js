
exports.up = function(knex) {
    return knex.schema.table('users', (tbl) => {
        tbl.datetime('last_logged_in_at');
    });
};

exports.down = function(knex) {
    return knex.schema.table('users', (tbl) => {
        tbl.dropColumn('last_logged_in_at');
    });
};
