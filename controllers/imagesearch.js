var config = require('../config');
//leaving config file out of git repo for obvious reasons
var request = require('request');
var express = require('express');
var mongo = require('mongodb').MongoClient;
var router = express.Router()

//start building search query
var key = config.development.apiKey;
var urlBase = 'https://www.googleapis.com/customsearch/v1?q=';
var urlMid = '&cx=001280181106248328357%3At15dna83cua&num='
var num = 5;
var urlEnd = '&searchType=image&key=' + key;

//get user & pass from config file, set mongoDB url
var user = config.development.database.username;
var pass = config.development.database.password;
var host = config.development.database.host;
var port = config.development.database.db_port;
var db = config.development.database.db;
var dbUrl = "mongodb://" + user + ":" + pass + "@" + host + ":" + port + "/" + db;

//router for imagesearch queries
router.use(function(req,res) {
	//break up initial url
	var query = req.url.split('?');

	//check for only one question mark in query
	if (query.length !== 2) {
		res.status(405).json({error:"malformed query"});
	} else if (query[1].split('&').length === 2) {
		//if there are two params, go in here
		var paramOne = query[1].split('&')[0];
		var paramTwo = query[1].split('&')[1];

		if (paramOne.split('=')[0] !== "term" || paramTwo.split('=')[0] !== "offset") {
			//if params don't have right name, return and quit
			res.status(405).json({error:"malformed query"});
		} else {
			//further param parsing...make sure each one only has one '='
			if (paramOne.split('=').length !== 2) {
				res.status(405).json({error:"malformed query"});
			} else if (paramTwo.split('=').length !== 2 || isNaN(paramTwo.split('=')[1])) {
				//if param two has more than one '=' or isn't a number, return and exit
				res.status(405).json({error:"malformed query"});
			} else {
				//get term query
				query = paramOne.split('=')[1];

				//get number of offsets - min 1, max 10
				if (Math.floor(Number(paramTwo.split('=')[1])) > 0 && Math.floor(Number(paramTwo.split('=')[1])) <= 10) {
					num = num = Math.floor(Number(paramTwo.split('=')[1]));
				} else if (Math.floor(Number(paramTwo.split('=')[1])) > 10) {
					num = 10;
				} else if (Math.floor(Number(paramTwo.split('=')[1])) < 1) {
					num = 1;
				}
				
				//build search url
 				var searchUrl = urlBase + query + urlMid + num + urlEnd;

 				//send get request to URL
				request(searchUrl, { json: true }, (err, searchRes, body) => {
  					if (err) { return console.log(err); }

  					var objArr = [];

  					//add objects to objArray
 					for (var i = 0; i < body.items.length; i++) {
 						var obj = {
 							url: body.items[i].link,
 							snippet: body.items[i].snippet,
 							thumbnail: body.items[i].image.thumbnailLink,
 							context: body.items[i].image.contextLink
 						};
 						objArr.push(obj);
 					}

 					//connect to DB
 					mongo.connect(dbUrl,function(err,db){
						if(err) console.log(err);

						//load collection
    					var docs = db.collection('history');

    					//build object to insert
    					var insertObj = {
        					search: query,
        					timestamp: new Date()
        				};

        				//insert object
        				docs.insert(insertObj, function(err, doc) {
        					if (err) console.error(err);

        					//close db connection, send response
        					db.close();
        					res.status(200).json(objArr);
    					});
    				});
				});
			}
		}

	} else if (query[1].split('&').length === 1) {
		//if only one param, enter here
		var paramOne = query[1].split('&')[0];

		//make sure param is called term
		if (paramOne.split('=').length !== 2 || paramOne.split('=')[0] !== "term") {
			res.status(405).json({error:"malformed query"});
		} else {
			//get query from param
			query = paramOne.split('=')[1];

			//build search url
 			var searchUrl = urlBase + query + urlMid + num + urlEnd;

 			//get request to search url
			request(searchUrl, { json: true }, (err, searchRes, body) => {
  				if (err) { return console.log(err); }

  				var objArr = [];

  				//add results to objArray
 				for (var i = 0; i < body.items.length; i++) {
 					var obj = {
 						url: body.items[i].link,
 						snippet: body.items[i].snippet,
 						thumbnail: body.items[i].image.thumbnailLink,
 						context: body.items[i].image.contextLink
 					};
 					objArr.push(obj);
 				}

 				//connect to DB
 				mongo.connect(dbUrl,function(err,db){
					if(err) console.log(err);

					//load collection
    				var docs = db.collection('history');

    				//build insertObj
    				var insertObj = {
        				search: query,
        				timestamp: new Date()
        			};

        			//insert to DB
        			docs.insert(insertObj, function(err, doc) {
        				if (err) console.error(err);

        				//close db connection, send response
        				db.close();
        				res.status(200).json(objArr);
    				});
    			});
	
			});
		}
	} else {
		//exit and return
		res.status(405).json({error:"malformed query"});
	}
});

module.exports = router;