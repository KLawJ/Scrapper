//Init
//var restify = require('restify');
var request = require('sync-request');
var fs = require('fs');
const execFile = require('child_process').execFile;

//State VARS
var host = "https://plcclegal.com/";

//Global functions
function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
}

while (1){
	var jobs = JSON.parse(
	    request('GET', host + 'sms/jobs')
	        .getBody('UTF8')
	);
	if(!jobs.newJob){
		console.log('No new job');
	}else{
		const child = execFile('node', ['processor.js', jobs.newJob], (error, stdout, stderr) => {
		  if (error) {
		    throw error;
		  }
		  console.log(stdout);
		});
	}
	sleep(1000);
}