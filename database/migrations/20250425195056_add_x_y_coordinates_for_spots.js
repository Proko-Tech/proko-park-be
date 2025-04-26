exports.up = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.integer('floor_plan_x');
        tbl.integer('floor_plan_y');
    });
};

exports.down = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.dropColumn('floor_plan_x');
        tbl.dropColumn('floor_plan_y');
    });
};
