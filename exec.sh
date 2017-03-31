rm -R data
mkdir data
mkdir log
host="http://klawj.tk"
infoURL="$host/smsapi"
echo $infoURL
a=`date --date "-$1 hours ago" +%d`
b=`date --date "-$1 hours ago" +%m%Y`
c=`date --date "-$1 hours ago" +%Y`
d=`date --date "-$1 hours ago" +%b`
e="http://clists.nic.in/ddir/PDFCauselists/kerala/$c/$d/"
f="013$a$b.pdf"
g="$e$f"
h=`curl -s -o /dev/null -w "%{response_code}" $g`
if [ $h == '200' ] && [ ! -f "log/$f" ]
then

cd data
wget $g
pdf2txt -t text -o cl.txt $f
wget $infoURL
cd ..

nodeOut=`node processor.js cl.txt smsapi`

if [ "$3" == 'TB' ] || [ "$2" == 'TB' ]
then
curl \
-X POST \
--form-string chat_id="@KLJICO" \
-F document="@data/smslist.json" \
https://api.telegram.org/bot373825778:AAEY4GbXCJvM09x2NICVdiu38JkwnuvoWk8/sendDocument
fi

if [ "$2" == 'SMS' ] || [ "$3" == 'SMS' ]
then
curl \
-X POST \
-H "Authorization:Basic a2xqaWNvOktsSkljTw==" \
-H "Content-Type:application/json" \
-H "Accept:application/json" \
--data-ascii "@data/smslist.json" \
https://smsapi.runacorp.com/restapi/sms/1/text/multi
fi

echo "Done."
echo "Done" > "log/$f"
echo "Node App Output :-"
echo $nodeOut
fi

