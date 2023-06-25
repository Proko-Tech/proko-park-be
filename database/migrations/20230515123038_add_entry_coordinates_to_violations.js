
exports.up = function(knex) {
    return knex.schema.table('violations', (tbl) => {
        tbl.text('entry_coordinates');
    });
};

exports.down = function(knex) {
    return knex.schema.table('violations', (tbl) => {
        tbl.dropColumn('entry_coordinates');
    });
};
