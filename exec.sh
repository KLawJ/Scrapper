path="/home/ubuntu/Scrapper"
rm -R "$path/data"
mkdir "$path/data"
mkdir "$pathlog"
host="http://keralalawjournal.com"


a=`curl $host/smsapi/jobs`

h=`curl -s -o /dev/null -w "%{response_code}" $a`
if [ $h == '200' ] && [ ! -f "log/$f" ]
then

cd "$path/data"
wget $a -O cl.pdf
pdf2txt -t text -o cl.txt cl.pdf
wget $host/smsapi/info -O info.json
cd ..

nodeOut=`node $path/processor.js cl.txt info.json`

if [ "$3" == 'TB' ] || [ "$2" == 'TB' ]
then
curl \
-X POST \
--form-string chat_id="@KLJICO" \
-F document="$path/data/smslist.json" \
https://api.telegram.org/bot373825778:AAEY4GbXCJvM09x2NICVdiu38JkwnuvoWk8/sendDocument
fi

if [ "$2" == 'SMS' ] || [ "$3" == 'SMS' ]
then
curl \
-X POST \
-H "Authorization:Basic a2xqaWNvOktsSkljTw==" \
-H "Content-Type:application/json" \
-H "Accept:application/json" \
--data-ascii "$path/data/smslist.json" \
https://smsapi.runacorp.com/restapi/sms/1/text/multi
fi

echo "Done."
echo "Done" > "$path/log/$f"
echo "Node App Output :-"
echo $nodeOut
fi
