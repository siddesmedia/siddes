const redis = require('redis');
const client = redis.createClient(process.env.REDISPORT);

module.exports = client;