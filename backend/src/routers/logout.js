const { logout } = require('../controllers/logout.js');

module.exports = (app) => {
    app.post('/logout', logout);
};
