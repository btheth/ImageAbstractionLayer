var config = require('../config');
//leaving config file out of git repo for obvious reasons
var express = require('express');
var mongo = require('mongodb').MongoClient;
var router = express.Router()

//get user & pass from config file, set mongoDB url
var user = config.development.database.username;
var pass = config.development.database.password;
var host = config.development.database.host;
var port = config.development.database.db_port;
var db = config.development.database.db;
var dbUrl = "mongodb://" + user + ":" + pass + "@" + host + ":" + port + "/" + db;

//router for latest query
router.use(function(req,res) {
	mongo.connect(dbUrl,function(err,db){
		if(err) console.log(err);

    	var docs = db.collection('history'); 

    	var results = docs.find({},{'_id':false, 'search':true, 'timestamp':true}).sort({'timestamp':-1});

    	results.toArray(function(err,arr) {
    		if (err) console.error(err);

    		db.close();
    		res.status(200).json(arr);
    	});
    });
});

module.exports = router;