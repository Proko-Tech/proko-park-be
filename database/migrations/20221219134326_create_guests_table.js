exports.up = function(knex) {
    return knex.schema.createTable('guests', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.text('first_name').notNullable();
        tbl.text('last_name').notNullable();
        tbl.text('email').notNullable();
        tbl.text('stripe_customer_id');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('guests');
};
