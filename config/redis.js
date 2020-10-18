const redis = require('redis');
var client;

client = redis.createClient(process.env.REDISPORT);

module.exports = client;