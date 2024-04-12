
exports.up = function(knex) {
    return knex.schema.createTable('multispot_sensors', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('lot_id')
        tbl.integer('left_spot_1');
        tbl.integer('left_spot_2');
        tbl.integer('left_spot_3');
        tbl.integer('right_spot_1');
        tbl.integer('right_spot_2');
        tbl.integer('right_spot_3');
        tbl.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('multispot_sensors');
};
