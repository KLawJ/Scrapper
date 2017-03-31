var request = require('request');
var name = "athul";
var mmsg = encodeURIComponent('No Cases found for " '+name+' ",\nPlease cross check with the Entire list !\nIf your name is wrong, please inform us.');
			request.get(
			    'https://control.msg91.com/api/sendhttp.php?'+
			    'authkey='+'143563AmEJVLE858b8ada0'+
			    '&mobiles='+ '9020508050'+
			    '&message='+mmsg+
			    '&sender='+'KLJICO'+
			    '&unicode=1'
			);