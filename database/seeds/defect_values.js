
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('defects').del()
      .then(function() {
          // Inserts seed entries
          return knex('defects').insert([
              {id: 1, secret_hash: 'secret', spot_id: 1, lot_id: 2, admin_id: 3, detail: 'No details', subject: 'No subject', defected_item: 'SENSOR', status: 'UNDER_REVIEW', status_message: "No message", is_auto_generator: true},
          ]);
      });
};