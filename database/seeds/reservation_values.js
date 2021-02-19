
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('reservations').del()
        .then(function() {
            // Inserts seed entries
            return knex('reservations').insert([
                {id: 1, user_id: 1, vehicle_id: 1, spot_hash:'dfjaksfsl', lot_id:1, elapsed_time:0, total_price: 0.00, is_paid:0},
                {id: 2, user_id: 2, vehicle_id: 1, spot_hash:'afdasdfad', lot_id:1, elapsed_time:1.2, total_price: 10.00, is_paid:1},
                {id: 3, user_id: 2, vehicle_id: 1, spot_hash:'afdasdfad', lot_id:2, elapsed_time:1.2, total_price: 10.00, is_paid:1},
            ]);
        });
};
