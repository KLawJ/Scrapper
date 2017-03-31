var fs = require('fs');
var jsonfile = require('jsonfile')
var objectSearch = require('object-search');
var request = require('request');

var prod = 1;
var host = "https://plcclegal.com/";

var rdata = JSON.parse(jsonfile.readFileSync(process.argv[2]+'.smslist'));
var smslist = rdata.list;

function requestsms(number, body){
	console.log(number+" : < "+body.substr(0,20)+" ... "+body.substr(body.length-20,body.length)+" >");
	var mmsg = encodeURIComponent(body);
	request.get(
	    //'https://control.msg91.com/api/sendhttp.php?'+
	    'https://hookb.in/KNRXm2dX?'+
	    'authkey='+'143563AmEJVLE858b8ada0'+
	    '&mobiles='+number+
	    '&message='+mmsg+
	    '&sender='+'KLJICO'+
	    '&unicode=1'
	);
}

smslist.forEach(function(item, index){
	requestsms(item.number, item.content);
});