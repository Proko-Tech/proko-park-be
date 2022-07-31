exports.up = function(knex) {
    return knex.schema.alterTable('violations', (tbl) => {
        tbl.dateTime('created_at').notNullable().alter();
        tbl.dateTime('resolved_at').alter();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('violations', (tbl) => {
        tbl.timestamp('created_at').notNullable().alter();
        tbl.timestamp('resolved_at').notNullable().alter();
    });
};
