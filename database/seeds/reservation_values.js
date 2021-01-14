
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('reservations').del()
        .then(function() {
            // Inserts seed entries
            return knex('reservations').insert([
                {id: 1, user_id: 1, vehicle_id: 1, spot_id:1, lot_id:1, elapsed_time:2.5, total_price: 30.00, is_paid:1},
            ]);
        });
};
