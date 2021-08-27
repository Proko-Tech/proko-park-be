const defected_item_enum = [
    'KIOSK',
    'BARRIER',
    'SENSOR'
];

const status_enum = [
    'REQUESTED',
    'UNDER_REVIEW',
    'RESOLVED'
];

exports.up = function(knex) {
  return knex.schema.createTable('defects', (tbl)=>{
    tbl.increments('id').unique().notNullable();
    tbl.text('secret_hash').notNullable();
    tbl.integer('spot_id');
    tbl.integer('lot_id').notNullable();
    tbl.integer('admin_id').notNullable();
    tbl.text('detail').notNullable();
    tbl.text('subject').notNullable();
    tbl.enum('defected_item', defected_item_enum, {useNative: true, enumName: 'defected_item_enum'});
    tbl.enum('status', status_enum, {useNative: true, enumName: 'status_enum'});
    tbl.text('status_message');
    tbl.boolean('is_auto_generator').notNullable();
    tbl.timestamps(true, true);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('defects');
};
