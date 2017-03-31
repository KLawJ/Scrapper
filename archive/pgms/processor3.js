var validator = require('validator');
var fs = require('fs');

var input = fs.readFileSync('data\\1.page','ASCII');

input
	.split('Before :')[1]
	.split(/(.*COURT.*)/i)[0]
	.replace(/[\r|\n|\\r|\\n]/g,'')
	.split(/\sAND/).forEach(function(item, index){
		console.log(
			validator.trim(
				item
					.replace(/[^A-Za-z\s\.]*/g, '')
			)	
		)
	})

	console.log(
			validator.trim(
	
input
	.split('Before :')[1]
	.split(/(.*COURT.*)/i)[1]
	.replace(/[\r|\n|\\r|\\n]/g,'')
	.replace(/[^A-Za-z\s\.]*/g, '')
				
			
			)	
		)