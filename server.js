var config = require('./config');
var imagesearch = require('./controllers/imagesearch');
var latest = require('./controllers/latest');
var express = require('express');
var logger = require('morgan');
var app = express();
app.use(logger());

app.get('/imagesearch', imagesearch);
app.get('/latest', latest);

app.use(function(req,res) {
	res.status(405).json({error: "invalid search", url: url});
})

//listen on port passed as 2nd arg, otherwise port from config file, otherwise listen on port 1337 by default
if (process.argv[2]) {
	app.listen(process.argv[2]);
} else if (config.development.port){
	app.listen(Number(config.development.port));
} else {
	app.listen(1337);
}