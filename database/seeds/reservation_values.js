
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('reservations').del()
        .then(function() {
            // Inserts seed entries
            return knex('reservations').insert([
                {id: 1, user_id: 1, vehicle_id: 1, spot_id:1, lot_id:1, elapsed_time:2.5, total_price: 30.00, is_paid:1},
                {id: 2, user_id: 1, vehicle_id: 1, spot_id:3, lot_id:1, elapsed_time:1.2, total_price: 10.00, is_paid:1},
                {id: 3, user_id: 1, vehicle_id: 1, spot_id:7, lot_id:2, elapsed_time:1.2, total_price: 10.00, is_paid:1},
            ]);
        });
};
