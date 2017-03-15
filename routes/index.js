var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;

const mongodb_url = "mongodb://admin:root@ds131340.mlab.com:31340/all3rgy";
var db;

MongoClient.connect(mongodb_url, (err, database) => {
    if (err) return console.log(err);
    db = database;
});

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('On /');
    return res.render('index');

});

//Search Handler
router.post('/search', (req,res) => {
    console.log(req.body['search']);
    
    var query = req.body['search'];
    
    var cursor = db.collection('order').find({name:query});

    cursor.toArray(function(err, results) {
	console.log(results);
	// results = results[0]['name'];
	return res.render('layout', {foods: results});
	// res.send(results);
	
	// send HTML file populated with quotes here
    });
    
});

router.get('/order', function(req, res, next) {
    
    var cursor = db.collection('order').find();
    
    db.collection('order').find().toArray(function(err, results) {
	console.log(results);
	// results = results[0]['name'];
	return res.render('layout', {foods: results});
	// res.send(results);
	
	// send HTML file populated with quotes here
    });
    
});

module.exports = router;
