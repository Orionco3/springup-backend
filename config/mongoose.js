const mongoose = require('mongoose');
const { mongo, env } = require('./vars');

// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

// Add event listeners to the mongoose connection
mongoose.connection.on('connecting', () => {
    console.info('Trying to establish a connection with MongoDB...');
});

mongoose.connection.on('connected', () => {
    console.info('MongoDB connected successfully!');
});

mongoose.connection.on('error', (err) => {
    console.error(`Connection to MongoDB failed: ${err}`);
    throw err;
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connection closed!!');
});

// // print mongoose logs in dev env
if (env === 'development') {
    mongoose.set('debug', true);
}

/**
 * Connect to MongoDB
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = async () => {
    await mongoose.connect(mongo.uri, {
        useNewUrlParser: true,
        keepAlive: 1,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    });

    return mongoose.connection;
};
