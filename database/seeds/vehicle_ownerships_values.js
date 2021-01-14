
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('vehicle_ownership').del()
        .then(function() {
            // Inserts seed entries
            return knex('vehicle_ownership').insert([
                {id: 1, vehicle_id: 1, user_id: 1, is_primary_owner:true},
            ]);
        });
};
