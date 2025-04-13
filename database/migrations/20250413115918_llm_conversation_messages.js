exports.up = function(knex) {
    return knex.schema.createTable('llm_conversation_messages', (tbl) => {
        tbl.increments('id').unique().notNullable();
        tbl.integer('conversation_id').notNullable();
        tbl.text('role').notNullable();
        tbl.text('content').notNullable();
        // creates created_at column and updated_at column
        tbl.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('llm_conversation_messages');
};
