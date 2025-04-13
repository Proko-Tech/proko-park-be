exports.up = function(knex) {
    return knex.schema.createTable('llm_conversations', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('admin_id').notNullable();
        tbl.text('summary');
        tbl.json('metadata');
        // creates created_at column and updated_at column
        tbl.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('llm_conversations');
};
