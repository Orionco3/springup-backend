const { createServer } = require('http');

const config = require('./config/vars');
const app = require('./config/express');

/**
 * Create a new HTTP server and pass the Express app as handler for each incoming request
 * We are creating the server this way because using `app.listen()` will create a new HTTP server which could not be used with Socket.io server.
 */
const httpServer = createServer(app);

// Start the server
const port = process.env.PORT || config.LISTEN_PORT;
httpServer.listen(port, () => {
    console.log(`Started HTTP server on port ${port}`);
});

// Export the server for using in other places (like socket.io)
module.exports = httpServer;
