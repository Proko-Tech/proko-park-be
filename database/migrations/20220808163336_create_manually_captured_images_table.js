
exports.up = function(knex) {
    return knex.schema.createTable('manually_captured_images', (tbl) => {
        tbl.increments('capture_id').unique().notNullable();
        tbl.integer('spot_id').notNullable();
        tbl.integer('admin_id');
        tbl.timestamp('created_at').defaultTo(knex.fn.now());
        tbl.timestamp('updated_at').defaultTo(knex.fn.now());
        tbl.text('image_url');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('manually_captured_images');
};
