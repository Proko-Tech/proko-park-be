exports.up = function(knex) {
    return knex.schema.table('prediction_results', (tbl) => {
        tbl.text('exit_image_url');
    });
};

exports.down = function(knex) {
    return knex.schema.table('prediction_results', (tbl) => {
        tbl.dropColumn('exit_image_url');
    });
};
