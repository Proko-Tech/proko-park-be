
exports.up = function(knex) {
    return knex.schema.createTable('manually_captured_images', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.text('spot_secret').notNullable();
        tbl.integer('admin_id');
        tbl.timestamps(true, true);
        tbl.text('image_url');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('manually_captured_images');
};
