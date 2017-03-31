var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var router = express.Router();
const MongoClient = require('mongodb').MongoClient;

const mongodb_url = "mongodb://admin:root@ds131340.mlab.com:31340/all3rgy";
var db;

function typoDistance(a, b) {
    if (a.length === 0) return b.length; 
    if (b.length === 0) return a.length; 

    var matrix = [];

    // increment along the first column of each row
    var i;
    for (i = 0; i <= b.length; i++) {
	matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for (j = 0; j <= a.length; j++) {
	matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
	for (j = 1; j <= a.length; j++) {
	    if (b.charAt(i-1) == a.charAt(j-1)) {
		matrix[i][j] = matrix[i-1][j-1];
	    } else {
		matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
					Math.min(matrix[i][j-1] + 1, // insertion
						 matrix[i-1][j] + 1)); // deletion
	    }
	}
    }

    return 1 - (matrix[b.length][a.length] / Math.max(a.length, b.length));
};

MongoClient.connect(mongodb_url, (err, database) => {
    if (err) return console.log(err);
    db = database;
});

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('On /');
    return res.render('index');

});

/*
 [ { _id: 58c82300f36d287eb5cb54c4,
 name: 'chicken rice',
 tags: 'gluten-free, whatever',
 rest_name: 'Babycupcakes' } ]
 */

//Search Handler
router.post('/search', (req,res) => {
    console.log(req.body);

    var namequery = req.body['search'];
    var allergyquery = req.body['allergies'];
    var cursor;
    var tagquery = [];
    var clearq;
    
    if (allergyquery != undefined && typeof allergyquery == "string"){
	tagquery = allergyquery.split(); 
    }
    else if (allergyquery == undefined)
    	cursor = db.collection('order').find({name:namequery});
    else
	cursor = db.collection('order').find({name:namequery, tags: {$in : tagquery }});
    
    cursor.toArray(function(err, results) {
	console.log(results);
	
	finalquery = [];
	
	if (results != undefined){
	    for (const r of results){
		clearq = true;
		
		for (const t of tagquery){
		    console.log(t in tagquery);
		    if (!(tagquery.indexOf(t) != -1)){
			clearq = false;
			break;
		    }
		}
		
		if (clearq)
		    finalquery.push(r);
	    }
	}

	console.log(finalquery);
	// results = results[0]['name'];
	return res.render('layout', {foods: finalquery});
	// res.send(results);
	
	// send HTML file populated with quotes here
    });
    
});

router.get('/order', function(req, res, next) {
    
    var cursor = db.collection('order').find();
    
    db.collectiotn('order').find().toArray(function(err, results) {
	console.log(results);
	// results = results[0]['name'];
	return res.render('layout', {foods: results});
	// res.send(results);
	
	// send HTML file populated with quotes here
    });
    
});

router.get('/scrape', function(req, res, next) {
    url = 'https://www.erinmckennasbakery.com/our-menu/';
    request(url, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request

        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

	    // Finally, we'll define the variables we're going to capture

	    var title, release, rating;
            var json = { title : "", release : "", rating : ""};

	    $('strong').filter(function (){

		var data = $(this);
		
		console.log(data.text());
	    });
	    
        }
    });
    
    return res.end('Scrapping!');
});



module.exports = router;


