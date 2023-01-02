
exports.up = function(knex) {
    return knex.schema.createTable('refunds', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('reservation_id').notNullable();
        tbl.text('stripe_refund_id').notNullable();
        tbl.text('reason').notNullable();
        // creates created_at column and updated_at column
        tbl.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('refunds');
};
