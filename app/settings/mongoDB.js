const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

let mongoClient = new MongoClient('mongodb://localhost:27017/', {
	useUnifiedTopology: true
});

module.exports.mongoClient = mongoClient;
module.exports.ObjectId = ObjectId;
