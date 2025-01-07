const { connect } = require('./config/mongoose');
require("dotenv").config();
// require('./cronJob/index');

(async () => {
    // Connect the database to the application and wait for it to be ready
    await connect();

    // Start the HTTP (express) server
    require('./server');

    // mount api v1 routes
    const app = require('./config/express');
    const routes = require('./routes/index');
    app.use('/api', routes);
})();