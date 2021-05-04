
exports.seed = function(knex) {
    // Deletes ALL existing entries
    return knex('admin_accounts').del()
        .then(function() {
            // Inserts seed entries
            return knex('admin_accounts').insert([
                {id: 1, admin_email: 'kurinoyuichi@gmail.com', admin_phone_number: '12345678910', admin_username: 'ykurino', admin_password_hash:'$2a$10$fBRo3pF3BVUpAru0bKxwQ.OQ9hn3CBWqTmpyKTJEJZ32/uBeKp5x6', organization_name: 'YK org', membership_status:'ACTIVE', notes: 'yuichik notes'},
                {id: 2, admin_email: 'jessicarhilario@gmail.com', admin_phone_number: '12345678910', admin_username: 'jhilario', admin_password_hash:'$2a$10$fBRo3pF3BVUpAru0bKxwQ.OQ9hn3CBWqTmpyKTJEJZ32/uBeKp5x6', organization_name: 'JH org', membership_status:'ACTIVE', notes: 'jessicah notes'},
            ]);
        });
};
