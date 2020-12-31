
exports.up = function(knex) {
    return knex.schema.createTable('vehicle', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.text('license_plate').notNullable();
        tbl.text('brand').notNullable();
        tbl.text('make').notNullable();
        tbl.text('model').notNullable();
        tbl.text('color').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('vehicle');
};
