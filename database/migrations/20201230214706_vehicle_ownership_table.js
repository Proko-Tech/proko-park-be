
exports.up = function(knex) {
    return knex.schema.createTable('vehicle_ownership', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('user_id').notNullable();
        tbl.integer('vehicle_id').notNullable();
        tbl.boolean('is_primary_owner').notNullable().defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('vehicle_ownership');
};
