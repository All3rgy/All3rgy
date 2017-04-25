var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var router = express.Router();
const MongoClient = require('mongodb').MongoClient;

const mongodb_url = "mongodb://admin:root@ds131340.mlab.com:31340/all3rgy";
var db;


// Credentials for calling Edamam API
var edamambase = "https://api.edamam.com/search?q=";
var appID = "27511a3c";
var appKey = "942220d8bf3bb23397fa7eb732745641";

//Included recipe filters are: balanced, high protein, low-fat, low-carb, vegan, vegetarian, sugar-conscious, peanut-free, tree-nut-free, alcohol-free

//========Calculates distance for typos===============
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
    // console.log(req.body);

    var edamamurl;
    
    //Getting filters from POST request
    var namequery = req.body['search'];
    var allergyquery = req.body['allergies'];
    var typequery;
    var cursor;
    var tagquery = [];
    var clearq;

    
    // Checks if the allergy is more than one word, turn it into a list
    if (allergyquery != undefined && typeof allergyquery == "string")
    	tagquery = allergyquery.split(); 
    else
	tagquery = allergyquery;

    if (tagquery != undefined){
	var health = "";
	for (var i = 0; i < tagquery.length; i++)
	    health += tagquery[i]+",";
	
	edamamurl = edamambase + req.body['search'] + "&app_id=" + appID + "&app_key=" + appKey + "&health="+health;


    }else
	edamamurl = edamambase + encodeURIComponent(req.body['search'].trim());

    console.log(edamamurl);

    var http = require("http");

    var request = http.get(url, function (response) {

    });

    if (req.body['type'] != undefined && typeof req.body['type'] == "string")
    {
	console.log(req.body['type'].split());
	typequery = req.body['type'].split();
	// typequery = tmp;
    }

    // console.log(typeof typequery);
    
    // Checks if users selected tags, only do specific query
    if (allergyquery == undefined && typequery == undefined)
    		cursor = db.collection('order').find({name:namequery});
	    else if (typequery != undefined){
    		
		var filterquery;
		if (tagquery != undefined)
    		    filterquery = tagquery.concat(typequery);
		else
		    filterquery = typequery;
		
		console.log(filterquery);
		console.log(namequery);
		
    		cursor = db.collection('order').find({name:namequery, tags: {$in : filterquery}});
	    }
	    else
    		// Checks if there are multiple allergies
    		cursor = db.collection('order').find({name:namequery, tags: {$in : tagquery }});

	    // console.log(cursor);
	    cursor.toArray(function(err, results) {
    		console.log(results);

    		//Final query to be pushed to db
    		finalquery = [];

    		//Checks to see if there are any results
    		if (results != undefined){

    		    //Double checks allergies to see if the allergy is in the result
    		    for (const r of results){
    			clearq = true;
			
			console.log("looping");
			console.log(tagquery);

			if (tagquery != undefined){
    			    for (const t of tagquery){
    				console.log(t in tagquery);
    				if (!(tagquery.indexOf(t) != -1)){
    				    clearq = false;
    				    break;
    				}
    			    }
			    
			}

			if (clearq)
    			    finalquery.push(r);
			
    		    }
    		}

		// finalquery = [{"name": "chicken rice", "owner": "Ashley"},
		// 	      {"name": "chicken over rice"},
		// 	      {"name": "chicken fried rice"}];
		
		console.log(finalquery);
		console.log(namequery);
		
		// send HTML file populated with quotes here
		return res.render('results', {foods: finalquery, prevsearch: {"name" : req.body['search']}});

		
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


