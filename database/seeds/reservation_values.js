
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('reservations').del()
        .then(function() {
            // Inserts seed entries
            return knex('reservations').insert([
                {id: 1, user_id: 1, vehicle_id: 1, spot_hash:'dfjaksfsl', lot_id:1, elapsed_time:0, total_price: 0.00, is_paid:0, reserved_at:'2021-02-19T11:02:00', status: 'RESERVED', card_id: 'cus_JJFai9q871ZZPR'},
            ]);
        });
};
