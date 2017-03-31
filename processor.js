//Init
var validator = require('validator');
var fs = require('fs');
var host = "http:klawj.tk/";

//State VARS
var deliveryMode = process.argv[3];

function prunePages(pages){
	pages.forEach(function(item, index){
		pages[index] = item
			.replace(/\s*Contd\.*\d*\s*Court[\s|\-|]*\d*\w*\s*Page\s*\d*\s*\d*\/\d*\/\d*/gm,'\n')
			.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~\n]*/g, '')
		//pages[index] = item.replace(/\n\s+[\w|\s|\-|\(|\)]+\n\s+\=+/g,'');
	});
	return pages;
}

function logPages(pages){
	pages.forEach(function(item, index){
		fs.writeFileSync('data/'+index+'.page', item);
	});
	return pages;
}

function objectifyPages(pages){
	var allCases = [];
	pages.forEach(function(item, index){
		try{
			var page = item;
			var entry = {};
			entry['date'] =
				validator.trim(
					page
						.split('Before :')[0]
						.split('/')[0]
						.replace(/\w+\,\sthe/,'')
					)
			entry['judge'] = [];
			page
				.split('Before :')[1]
				.split(/(.*COURT.*)\(\w*\s\w*\)/i)[0]
				.replace(/[\r|\n|\\r|\\n]/g,'')
				.split(/\sAND/).forEach(function(item, index){
					entry['judge']
						.push(
							validator.trim(
								item
									.replace(/[^A-Za-z\s\.]*/g, '')
							)
						);
				})
			entry['room'] =
				validator.trim(
					page
						.split('Before :')[1]
						.split(/(.*COURT.*)\(\w*\s\w*\)/)[1]
						.replace(/[\r|\n|\\r|\\n]/g,'')
					)
			/*if(entry['room'].indexOf(' - ')!=-1)
				entry['room'] = entry['room'].split(' - ')[1];
			*/
			var casesF = "";
			var caseFS = "";
			var cases = page
				.split('Before :')[1]
				.split(/\=+/);

			cases = cases
				.splice(1, cases.length)
				.join('')
				.replace('XXXX','')
				.replace(/^\s*[\r\n]/gm,'')
				.replace(/\n(\d+\.)/gm,'\n####$1')
				.replace(/(NOTE\:)/gm,'\n####$1')
			cases = cases
				.split('####')
			cases.forEach(function (item, index){
					if(item.indexOf('WITH') != -1){
						cases[index] = 
							item
								.split(/WITH/)[0]
								+
							"\n####"
						item.split(/WITH/g).forEach(function(wb, wbi){
							if(wbi !=0){
								cases[index] +=
									item
									.split(/WITH/)[0]
									.split(/\n/)[0]
									.replace(/(\d\.).*/m,'$1 ')
									+
								validator.trim(item.split(/WITH/)[wbi])
									+
								"\n####"
							}
						})
					}else{
						cases[index] += "####"
					}
				});
			cases = cases
				.join('')
				.split('####')
				//.replace(/WITH/g,'####')
				//.replace(/\n\s*/gm,'\n')
				//\d*\.\s
			cases.forEach(function(item, index){
				var caseIQ = {};
				caseIQ['date'] = entry['date']
				caseIQ['room'] = entry['room']
				caseIQ[ 'judge'] = entry['judge']
				var chars = item
					.split('\n')[0]
					.replace(/.*(\s{2,}).*/,'$1')
					.length
				chars += item
					.split('\n')[0]
					.replace(/(.*)(\s{2,})(.*)/,'$1')
					.length
				validator.trim(item)
					//.replace(/\n/gm,'$\n')
					.split('\n')
					.forEach(function(item, index){
						if(index == 0 ){
							caseFS += item.substring(0, chars)+ '\n';
							caseIQ['item'] = item
								.substring(0, chars)
								.replace(/(\d*).*/,'$1')
							caseIQ['number'] = validator.trim(
								item
									.substring(0, chars)
									.replace(/\d*\.(.*)/,'$1')
							)
						}
					})
				var tempChar = "";
				validator.trim(item)
					//.replace(/\n/gm,'$\n')
					.split('\n')
					.forEach(function(item, index){
						caseFS += item.substring(chars, item.length) + '\n';
						tempChar += item.substring(chars, item.length) + '\n';
					})
				caseIQ['advs'] = tempChar
				try{
					caseIQ['resp'] = validator.trim( tempChar.split('/')[0] );
					caseIQ['defe'] = validator.trim( tempChar.split('/')[1] );
				}catch(e){
					console.log(e);
				}
				casesF += validator.trim(item) + '\n>>\n';
				allCases.push(caseIQ);
			})
				fs.writeFileSync('data/'+index+'.casesF', casesF);
				fs.writeFileSync('data/'+index+'.caseFS', 	caseFS);
		}catch(e){
			console.log(e)
		}
	});
	return allCases;
}

function logCases(Allcases){
	fs.writeFileSync('data/output.json', JSON.stringify(Allcases));
	return Allcases;
}

function compress(object, reps, judge){
    reps.forEach(function(item, index){
        if(item.rep != null)
            object = object.replace(new RegExp(item.org, 'ig'), item.rep);
        else
            object = object.replace(new RegExp(item.org, 'ig'), "");
    });

    object = validator.trim(object);
    
    if(judge){
    	var obj = [];
    	object
    		.split(/\.|\s/g)
    		.forEach(function(item, index){
    			var c = validator.trim(item).charAt(0);
    			if(c!=null)
    				obj.push(c);
    		});
    	obj = obj.join('')
    	return obj;
    }else{
    	return object;
	}
	
}

function requestTBtDelivery(number, body){
    var mmsg = body;
    console.log(
        request(
            'POST',
            'https://api.telegram.org/bot373825778:AAEY4GbXCJvM09x2NICVdiu38JkwnuvoWk8/sendMessage',
            {
                "json":{
                	'parse_mode' : 'markdown',
                    //'chat_id' : "6984850",
                    'chat_id' : "@KLJICO",
                    'text' : number+'\nKLJICO\n'+mmsg
                }
            }
        ).getBody('UTF8')
    );
}

function findAdvocateResultBuilder(allCases, user, inputInfo){
	var output = {};
	var count = 0;
	var text = user.advcid + '\n';
	    allCases.forEach(function(cause, causeIndex){
	    	if(cause['advs'].indexOf(user.advcid)!=-1){
	    		count ++;
	    		text += compress(cause.room, inputInfo.reps,false) + '-'
	    		cause.judge.forEach(function(item, index){
	    			if(index!=0)
	    				text += '&';
	    				text += compress(item, inputInfo.reps, true);
	    		})
	    		text += '-' + cause.item
	    		text += '-' + cause.number + '\n'
	    	}
	    })
	if(count == 0)
		text += '\nNo records found. \nPlease check with the entire Causelist.'
	else
		text += '\nFor a more detailed list, please visit, http://klj.io/468561';
	//text += '\nPlease ignore the previous SMS.';
	output['from']='KLJICO';
	output['text']=text;
	output['to']='91'+user.number;
	return output;
}

function findAdvocateCases(allCases, inputInfo){
	var output={};
	output['messages']=[];
    inputInfo.subs.forEach(function(user, userIndex){
    	output.messages.push(findAdvocateResultBuilder(allCases, user, inputInfo))
    });
	return output;
}

function queryBuilder(allCases){
	var output = "TRUNCATE TABLE test.records;\n";

	allCases.forEach(function(item, index){
		try{
			var judgelist = "";
			item.judge.forEach(function(item, index){
				if(index!=0)
					judgelist += "<br>" + item;
				else
					judgelist += item;
			});
			output += 
				("INSERT INTO test.records " 
				+ "(item_no,case_no,room,judge,resp,defe,case_block)"
				+ "VALUES ("+item.item+",'"+item.number+"','"+item.room+"',"
				+ "'"+judgelist+"','"+item.resp+"','"+item.defe+"','"+item.advs+"');")
					.replace(/\n/gm,"<br>") + "\n\n";
		}catch(e){
			console.log(e);
		}
	});

	return output;
}

function netwrokQuery(findings, reqURL){
	request({
		method : "POST",
		url : reqURL,
		headers : {
			"Authorization" : "Basic a2xqaWNvOktsSkljTw==",
			"Content-Type" : "application/json",
			"Accept" : "application/json"
		},
		body : JSON.stringify(findings),
	},
	function(err,httpResponse,body){
		console.log(JSON.stringify(findings));
	})
}

function main(){
	var input = fs.readFileSync('data/'+process.argv[2],'ASCII');
	var pages = input.split(/\t*IN \w* \w* COURT OF \w* AT \w*/g);
	var allCases = logCases(
		objectifyPages(
			logPages(
				prunePages(
					pages
				)
			)
		)
	)
	fs.writeFileSync("data/query.log", queryBuilder(allCases));
    var inputInfo = JSON.parse(
        fs.readFileSync('data/'+process.argv[3],'UTF8')
    );
    var findings = findAdvocateCases(
		allCases,
		inputInfo
	)
	fs.writeFileSync('data/smslist.json',JSON.stringify(findings));
}

main();
