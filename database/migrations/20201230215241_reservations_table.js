
exports.up = function(knex) {
    return knex.schema.createTable('reservations', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('user_id').notNullable();
        tbl.integer('vehicle_id').notNullable();
        tbl.text('spot_hash').notNullable();
        tbl.integer('lot_id').notNullable();
        tbl.float('elapsed_time').notNullable();
        tbl.float('total_price').notNullable();
        tbl.boolean('is_paid').defaultTo(false);
        tbl.timestamps(true,true);// creates created_at column and updated_at column

    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('reservations');
};

