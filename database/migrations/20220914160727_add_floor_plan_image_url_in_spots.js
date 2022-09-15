
exports.up = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.text('floor_plan_image_url');
    });
};

exports.down = function(knex) {
    return knex.schema.table('spots', (tbl) => {
        tbl.dropColumn('floor_plan_image_url');
    });
};
