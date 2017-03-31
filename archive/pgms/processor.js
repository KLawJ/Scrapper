//Init
var cheerio = require('cheerio');
var request = require('sync-request');

//State VARS
var host = "https://plcclegal.com/";
var deliveryMode = process.argv[3];
//Data VARS
var replcdata;
var smsNeeded=0;

//Consts
const shit1 = '<body onload="javascript:window.history.go(1);" data-gr-c-s-loaded="true">';
const shit2 = '</b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></body><span class="gr__tooltip"><span class="gr__tooltip-content"></span><i class="gr__tooltip-logo"></i><span class="gr__triangle"></span></span></html>';
const shit3 = 'HIGH COURT OF JUDICATURE AT KERALA CAUSE LIST</b></center><b><br>';

//Search Functions

function renderSMS(number, body){
    var results = []
    if(body.length < 2800){
        results.push({
            "cost" : Math.ceil(body.length/150),
            "content" :{
                "number"    : number,
                "body"      : body
            }
        });
    }else{
        body.match(new RegExp('(.*\n){90}', 'g')).forEach(
            function(item, index){
                results.push({
                    "cost" : Math.ceil(item.length/150),
                    "content" :{
                        "number"    : number,
                        "body"      : item + "\n Page " + (index+1) + " of " +  body.match(new RegExp('(.*\n){90}', 'g')).length
                    }
                });
            }
        );
    }
    return results;
}

function check(object, text){
    var result = false;
    object.forEach(function (item, index) {
        if(item!=null)
            if(item.indexOf(text)!=-1){
                result = true;
            }
    });
    return result;
}

function compress(object, allReplacements){
    allReplacements.forEach(function(item, index){
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

function generateSMSList(allCases, allUsers, allReplacements){
    var tempUser;
    var SMSRender;
    var SMSCost = 0;
    var SMSList = [];
    allUsers.forEach(function(item, index){
        var number = item.number;
        var msg = allCases.date;
        var count = 0;
        tempUser = item.advcid;
        allCases.cases.forEach(function (item, index) {
            if(check(item, tempUser)==true){
                count++;
                msg = msg + '\n' + item[0]
                + '-' + compress(item[1], allReplacements)
                + '-' + item[6].replace('.','')
                + '-' + item[3];
            }
        });
        allReplacements.forEach(function(item, index){
            if(item.rep != null)
                msg = msg.replace(new RegExp(item.org, 'ig'), item.rep);
            else
                msg = msg.replace(new RegExp(item.org, 'ig'), "");
        });
        if(count)
            SMSRender = renderSMS(number, msg);
        else
            SMSRender = renderSMS(number,'No Cases found for " '+tempUser+' ",\nPlease cross check with the Entire list !\nIf your name is wrong, please inform us.');
        SMSRender.forEach(function(item, index){
            SMSList.push(item.content);
            SMSCost += item.cost;
        });
    });
    return {
        "list" : SMSList,
        "cost" : SMSCost
    }
}

//Send Functions

function requestSMSDelivery(number, body){
    var mmsg = encodeURIComponent(body);
    console.log(
        request(
            'GET',
            'https://control.msg91.com/api/sendhttp.php?'+
            'authkey='+'143563AmEJVLE858b8ada0'+
            '&mobiles='+number+
            '&message='+mmsg+
            '&sender='+'KLJICO'+
            '&unicode=1'
        ).getBody('UTF8')
    );
}

function requestTBtDelivery(number, body){
    //console.log(number+" : < "+body.substr(0,20)+" ... "+body.substr(body.length-20,body.length)+" >");
    var mmsg = body;
    console.log(
        request(
            'POST',
            'https://api.telegram.org/bot373825778:AAEY4GbXCJvM09x2NICVdiu38JkwnuvoWk8/sendMessage',
            {
                "json":{
                    'chat_id' : "6984850",
                    'text' : number+'\nKLJICO\n'+mmsg
                }
            }
        ).getBody('UTF8')
    );
}

function requestDelivery(number,body){
    deliveryMode.split(',').forEach(function (item, index){
        switch(item){
            case 'SMS' : requestSMSDelivery(number, body);
            case 'TBt' : requestTBtDelivery(number, body);
            break;
        }
    });
}

//Parsing Functions

function parseFileData(inputFile, topics){
    var pTopic;
    var finaldata=[];
    data = inputFile
        .split(shit1)[1]
        .split(shit2)[0];
    var date = data.split(shit3)[0];
    date = date.replace("<b><center>CAUSELIST FOR ",'');
    date = date.replace("<br><b>",'');
    data = data
        .split(shit3)[1]
        .replace(/\n/g, "")
        .replace(/\r/g, "")
        .replace(/<b><br><\/b><center><b>/g,"\n<b><br></b><center><b>");
    var dataset = data.split(/\n/g);
    var outputlog = "";
    dataset.forEach(function (item, index){
        if(index > 0 ){
            var tempCNG = dataset[index].split('<center></center><br>')[0]
                .replace('<b><br></b><center><b>','')
                .replace('<br></b></center><br><b>','');
            var i;
            var advagg = tempCNG.split(/\<br\>/ig)[1];
            for(i=2; i<=tempCNG.match(/\<br\>/ig).length; i++){
                advagg = advagg.trim() + "&." + tempCNG.split(/\<br\>/ig)[i];
            }
            var cng = [
                    tempCNG.split('<br>')[0],
                    advagg
                ]
            var temptype = "";
            var tables = dataset[index].split('<center></center><br>')[1].toString();
            tables = tables.replace(/\<\/table\>/g,'</table>\n');
            tables.split('\n').forEach(function(item, index){
                //console.log("Table no : " + index)
                $ = cheerio.load(item);
                $('table').each(function(i, elem){
                    $(this).find('tbody').find('tr').each(function(i, elem){
                        switch($(this).find('td').length){
                            case 1 :
                                var temptopic = $(this).html()
                                        .replace(/\<[\w|\"|\=|\s|\-]+\>/g,"")
                                        .replace(/\<\/[\w|\"|\=|\s|\-]+\>/g,""); 
                                if(topics.indexOf(temptopic)!=-1)
                                    pTopic = temptopic;
                            break;
                            case 5 :
                                var ino = $(this)
                                    .find('td:nth-child(1)')
                                    .find('pre-line:nth-child(1)')
                                    .text()
                                var cno = $(this)
                                    .find('td:nth-child(2)')
                                    .find('pre-line:nth-child(1)')
                                    .text()
                                var cpet = $(this)
                                    .find('td:nth-child(4)')
                                    .find('pre-line:nth-child(1)')
                                    .text()
                                var cres = $(this)
                                    .find('td:nth-child(5)')
                                    .find('pre-line:nth-child(1)')
                                    .text()
                                var tempdata = [];
                                tempdata.push(cng[0]);      //0
                                tempdata.push(cng[1]);      //1
                                tempdata.push(pTopic);      //2
                                tempdata.push(cno);         //3
                                tempdata.push(cpet);        //4
                                tempdata.push(cres);        //5
                                tempdata.push(ino);         //6
                                finaldata.push(tempdata);
                            break;
                            default:
                        }
                    });
                });
            });
        }
    });
    return({
        "date":date,
        "cases":finaldata
    });
}

//Start
function main(){
    var inputInfo = JSON.parse(
        request('GET', host + 'sms/'+process.argv[2]+'/info')
            .getBody('UTF8')
    );
    var inputFile =
        request('GET', host + 'sms/'+process.argv[2]+'/file')
            .getBody('UTF8')
    var allCases = parseFileData(
        inputFile,
        inputInfo.topics
    );
    var allSMSes = generateSMSList(
        allCases,
        inputInfo.allUsers,
        inputInfo.allReplacements
    );
    //Sending Stage
    console.log("We need " + (allSMSes.cost+1) + " SMSes");
    if( inputInfo.user_balance > (allSMSes.cost+1) ){
        if( inputInfo.main_balance > (allSMSes.cost+1) ){
            allSMSes.list.forEach(function(item, index){
                requestDelivery(item.number, item.body);
            });
            requestDelivery(
                inputInfo.user_number,
                "Batch Cost : "+ (allSMSes.cost+1) +
                "\nUser Balance : "+ (inputInfo.user_balance-(allSMSes.cost+1))
            )
            request(
                'POST',
                host + 'sms/'+process.argv[2]+'/info',
                {
                    "json":{
                        "status" : 2,
                        "cost" : (allSMSes.cost+1)
                    }
                }
            );
        }
        else{
            requestDelivery(
                inputInfo.user_number,
                "Gateway Issue\n"+
                "Admin Informed\n"+
                "Contact Admin, if issue is not resolved in 30 mins"
            )
            requestDelivery(
                inputInfo.admin_number,
                "Main SMS Balance too low to execute task."+
                "\nBatch Cost : "+allSMSes.cost+
                "\nUser Balance : "+inputInfo.user_balance+
                "\nMain Balance : "+inputInfo.main_balance+
                "\nUser Number  : "+inputInfo.user_number
            )
            request(
                'POST',
                host + 'sms/'+process.argv[2]+'/info',
                {
                    "json":{
                        "status" : 4,
                        "cost" : 2
                    }
                }
            );
        }
    }
    else{
        requestDelivery(
            inputInfo.user_number,
            "User SMS Balance too low to execute task."
        )
        requestDelivery(
            inputInfo.admin_number,
            "User SMS Balance too low to execute task."+
            "\nBatch Cost : "+allSMSes.cost+
            "\nUser Balance : "+inputInfo.user_balance+
            "\nMain Balance : "+inputInfo.main_balance+
            "\nUser Number  : "+inputInfo.user_number
        )
        request(
            'POST',
            host + 'sms/'+process.argv[2]+'/info',
            {
                "json":{
                    "status" : 4,
                    "cost" : 2
                }
            }
        );
    }
}

main();