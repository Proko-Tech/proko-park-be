exports.up = function(knex) {
    return knex.schema.createTable('lot_ownerships', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('admin_id').notNullable();
        tbl.integer('lot_id').notNullable();
        tbl.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('lot_ownerships');
};

