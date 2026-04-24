const bcrypt = require ('bcryptjs');

bcrypt.hash('adminotica@2026', 10 ).then(console.log);