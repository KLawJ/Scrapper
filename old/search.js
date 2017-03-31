var fs = require('fs');
var jsonfile = require('jsonfile')
var objectSearch = require('object-search');
var request = require('request');

var prod = 1;
var host = "https://plcclegal.com/";

var rdata = JSON.parse(jsonfile.readFileSync(process.argv[2]+'.caselist'));
var finaldata = rdata.data;

var replcdata;
var smsList = [];
var smsNeeded = 0;

function requestsms(number, body){
	console.log(number+" : < "+body.substr(0,20)+" ... "+body.substr(body.length-20,body.length)+" >");
	smsNeeded += Math.ceil(body/150);
	smsList.push({
		"number":number,
		"content":body
	});
}

function sendsms(number, body){
	if(body.length < 2800){
		requestsms(number,body)		
	}else{
		body.match(new RegExp('(.*\n){90}', 'g')).forEach(
			function(item, index){
				requestsms(
					number,
					item + "\n Page " + (index+1) + " of " +  body.match(new RegExp('(.*\n){90}', 'g')).length
				);
			}
		);
	}
}

function check(object, text){
	var result = false;
	object.forEach(function (item, index) {
		if(item!=null)
	        if(item.includes(text)){
	            result = true;
	        }
    });
    return result;
}

function compress(object){
	replcdata.forEach(function(item, index){
		if(item.rep != null)
			object = object.replace(new RegExp(item.org, 'ig'), item.rep);
		else
			object = object.replace(new RegExp(item.org, 'ig'), "");
	});
	var obj = [];
	object = object.trim();
	object = object.split(/(\.|\s)/gi)
	object.forEach(function(item, index){
		if( item.charAt(0)!='.' && item.charAt(0)!=' ' )
			obj.push(item.charAt(0));
		if( item.charAt(item.length-1)=='&')
			obj.push('&');
	});
	obj = obj.join('');
	return obj;
}

function findnsend(id, number){
	var msg = rdata.date;
	var count = 0;
	finaldata.forEach(function (item, index) {
		//console.log("checking : " + item)
		if(check(item, id)==true){
			count++;
			msg = msg + '\n' + item[0]
			+ '-' + compress(item[1])
			+ '-' + item[6].replace('.','')
			+ '-' + item[3];
		}
	});
	replcdata.forEach(function(item, index){
		if(item.rep != null)
			msg = msg.replace(new RegExp(item.org, 'ig'), item.rep);
		else
			msg = msg.replace(new RegExp(item.org, 'ig'), "");
	});
	if(prod && count){
		sendsms(number, msg);
	}
	else
		if(prod && !count){
			sendsms(number,'No Cases found for " '+id+' ",\nPlease cross check with the Entire list !\nIf your name is wrong, please inform us.')
		}
		else
			console.log(msg);
}


	request.get(
		host + 'smsrep',
	    function (error, response, body) {
	        if (!error && response.statusCode == 200) {
	            replcdata = JSON.parse(body);
				request.get(
				    host + 'sms',
				    function (error, response, body) {
				        if (!error && response.statusCode == 200) {
				            JSON.parse(body).forEach(function(item, index){
				            	console.log(item.advcid + " :: " + item.number + ", completed");
				            	findnsend(item.advcid,item.number);
				            });
				        }
				    }
				);
	        }
	    }
	);

	jsonfile.writeFileSync(process.argv[2]+'.smslist', JSON.stringify(
	    {
	        "cost":smsNeeded,
	        "list":smsList
	    }
	));
