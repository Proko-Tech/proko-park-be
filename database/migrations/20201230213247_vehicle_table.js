
exports.up = function(knex) {
    return knex.schema.createTable('vehicles', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.text('license_plate').notNullable();
        tbl.text('brand').notNullable();
        tbl.text('make');
        tbl.text('model');
        tbl.text('color');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('vehicles');
};
