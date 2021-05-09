
exports.up = function(knex) {
    return knex.schema.alterTable('lots', (tbl) => {
        tbl.integer('admin_id').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('lots', (tbl) => {
        tbl.integer('admin_id').notNullable();
    });
};
