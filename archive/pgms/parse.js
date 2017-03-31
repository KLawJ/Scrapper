var fs = require('fs');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile')

var finaldata=[];

const shit1 = '<body onload="javascript:window.history.go(1);" data-gr-c-s-loaded="true">';
const shit2 = '</b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></b></body><span class="gr__tooltip"><span class="gr__tooltip-content"></span><i class="gr__tooltip-logo"></i><span class="gr__triangle"></span></span></html>';
const shit3 = 'HIGH COURT OF JUDICATURE AT KERALA CAUSE LIST</b></center><b><br>';

var topics = ["ADMISSION","PETITIONS","FOR HEARING","CONTEMPT OF COURT CASES  FOR ADMISSION ","FOR APPEARANCE","FOR DISPOSAL","FILING DEFECT","FOR ORDERS","PETITIONS SUPPLEMENTARY","TO BE SPOKEN TO","ANTICIPATORY BAIL FOR ADMISSION","DEFECT","ADMISSION SUPPLEMENTARY","APPEARANCE FOR MEDIATION","CONTEMPT OF COURT CASES  FOR HEARING ","CONTEMPT OF COURT CASES PETITIONS","FOR JUDGEMENT","REGULAR BAIL FOR ADMISSION","DEVASWOM BOARD CASES","ELECTION PETITIONS","HABEAS CORPUS  FOR HEARING ","HABEAS CORPUS FOR APPEARANCE"];

var pTopic;

var data = fs.readFileSync(
    process.argv[2],
    'UTF8'
);

data = data
    .split(shit1)[1]
    .split(shit2)[0];
date = data.split(shit3)[0];
date = date.replace("<b><center>CAUSELIST FOR ",'');
date = date.replace("<br><b>",'');
data = data
    .split(shit3)[1]
    .replace(/\n/g, "")
    .replace(/\r/g, "")
    .replace(/<b><br><\/b><center><b>/g,"\n<b><br></b><center><b>");
var dataset = data.split(/\n/g);
//console.log(dataset[1]);
var outputlog = "";
dataset.forEach(function (item, index){
    console.log(index+" completed !");
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
                            if(topics.includes(temptopic))
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
                            //console.log(cng[0]+"::"+cng[1]+"::"+pTopic+"::"+cno+"::"+cpet+"::"+cres)
                        break;
                        case 0 :
                            //console.log('Zero !');
                        break;
                        default:
                    }
                });
            });
        });
    }
});
jsonfile.writeFileSync(process.argv[2]+'.caselist', JSON.stringify(
    {
        "date":date,
        "data":finaldata
    }
));