exports.up = function(knex) {
    return knex.schema.createTable('admin_lot_relations', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('admin_id').notNullable();
        tbl.integer('lot_id').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('admin_lot_relations');
};

