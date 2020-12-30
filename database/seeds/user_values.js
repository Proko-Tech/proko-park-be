
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
          { id: 1, email: 'jessica@gmail.com', phone_number: '5621231234', hash: "b'$2b$12$JcXFbjBgwxAjH5i01FRTGu4zYA1VSuFbk/uMvx6YRIvAyJgowFFUi'", secret: "b'$2b$12$JcXFbjBgwxAjH5i01FRTGu'", sign_up_type: 'EMAIL' },
          { id: 2, email: 'thomas@gmail.com', phone_number: '5621231234', hash: "b'$2b$12$dDz7J1rUpSnHxuCX.YYE1eJlEA4chtpoLAiDFG6Yd3/N/Jq6ynw4e'", secret: "b'$2b$12$dDz7J1rUpSnHxuCX.YYE1e'", sign_up_type: 'EMAIL' },
          { id: 3, email: 'yuichi@gmail.com', phone_number: '5621231234', hash: "b'$2b$12$spQJ7BYKN1/hz.f4t7MH9OqSUUtGhyDsbMmpTkb5GNTq785mhU.oy'", secret: "b'$2b$12$spQJ7BYKN1/hz.f4t7MH9O'", sign_up_type: 'EMAIL' },
          { id: 4, email: 'don@gmail.com', phone_number: '5621231234', hash: "b'$2b$12$bXHxFs0XVS0B64E6VjDmsOGXIRItPH8TKq9ahXyXjenNTeQHWHJ7G'", secret: "b'$2b$12$bXHxFs0XVS0B64E6VjDmsO'", sign_up_type: 'EMAIL' },
          { id: 5, email: 'andrew@gmail.com', phone_number: '5621231234', hash: "b'$2b$12$4aE.rSVWzJiji6eUSmVlxuLqc5HUdLBzuO/8r40ZUkpJ3Ey6YQ47y'", secret: "b'$2b$12$4aE.rSVWzJiji6eUSmVlxu'", sign_up_type: 'EMAIL' },
          { id: 6, email: 'rob@gmail.com', phone_number: '5621231234', hash: "b'$2b$12$4aE.rSVWzJiji6eUSmVlxuLqc5HUdLBzuO/8r40ZUkpJ3Ey6YQ47y'", secret: "b'$2b$12$OQKQb5NiwUupFye1BL5r/O'", sign_up_type: 'EMAIL' },
      ]);
    });
};
