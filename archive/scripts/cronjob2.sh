rm -R data/*
a=`date --date "-13 hours ago" +%d`
b=`date --date "-13 hours ago" +%m%Y`
c=`date --date "-13 hours ago" +%Y`
d=`date --date "-13 hours ago" +%b`
e="http://clists.nic.in/ddir/PDFCauselists/kerala/$c/$d/"
f="013$a$b.pdf"
g="$e$f"
cd data
h=`curl -s -o /dev/null -w "%{response_code}" $g`
let i=1000
let run=0
while [ $i -gt 0 ]
do
	if [ $h == '200' ]
	then
		let run=1
		break
	else
		echo ":$h:"
		h=`curl -s -o /dev/null -w "%{response_code}" $g`
		sleep 18
		echo retrying
	fi
	((i--))
done
if [ $run = 1 ]
then
cd data
wget $g
pdf2txt -t text -o cl.txt $f
wget https://plcclegal.com/sms/123457/info
cd ..
npm start
curl \
-X POST \
--form-string chat_id="@KLJICO" \
-F document="@data/smslist.json" \
https://api.telegram.org/bot373825778:AAEY4GbXCJvM09x2NICVdiu38JkwnuvoWk8/sendDocument

curl \
-X POST \
-H "Authorization:Basic a2xqaWNvOktsSkljTw==" \
-H "Content-Type:application/json" \
-H "Accept:application/json" \
--data-ascii "@data/smslist.json" \
https://smsapi.runacorp.com/restapi/sms/1/text/multi
echo "Done."
else
curl \
-X POST \
--form-string chat_id="@KLJICO" \
-F text="Sending SMS Failed" \
https://api.telegram.org/bot373825778:AAEY4GbXCJvM09x2NICVdiu38JkwnuvoWk8/sendMessage
fi
