
exports.up = function(knex) {
    return knex.schema.createTable('prediction_results', (tbl)=>{
        tbl.increments('id').unique().notNullable();
        tbl.text('image_url').notNullable();
        tbl.boolean('is_car_prediction').notNullable();
        tbl.boolean('true_car_prediction');
        tbl.boolean('license_plate_prediction').notNullable();
        tbl.boolean('true_license_prediction');
        tbl.timestamp('created_at').notNullable();
        tbl.text('spot_secret').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('prediction_results');
};
