
exports.up = function(knex) {
    return knex.schema.createTable('defect_actions', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('defect_id').notNullable();
        tbl.text('action_message');
        tbl.text('user_reply_message');
        tbl.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('defect_actions');
};