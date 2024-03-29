const reservation_status = [
    'RESERVED',
    'ARRIVED',
    'PARKED',
    'FULFILLED',
    'CANCELED',
];

exports.up = function(knex) {
    return knex.schema.createTable('reservations', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('user_id').notNullable();
        tbl.integer('vehicle_id').notNullable();
        tbl.text('license_plate').notNullable();
        tbl.text('spot_hash').notNullable();
        tbl.integer('lot_id').notNullable();
        tbl.float('elapsed_time').defaultTo(0).notNullable();
        tbl.float('total_price').defaultTo(0).notNullable();
        tbl.boolean('is_paid').defaultTo(false);
        tbl.text('stripe_charge_id');
        tbl.text('card_id');
        tbl.datetime('reserved_at');
        tbl.datetime('arrived_at');
        tbl.datetime('parked_at');
        tbl.datetime('exited_at');
        tbl.enum('status', reservation_status, {
            useNative: true,
            enumName: 'reservation_status',
        })
            .notNullable()
            .index();
        // creates created_at column and updated_at column
        tbl.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('reservations');
};
