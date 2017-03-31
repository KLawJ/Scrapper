rm -R data
mkdir data
host="http://klawj.tk"
infoURL="$host/smsapi"
echo $infoURL
a=`date --date "-13 hours ago" +%d`
b=`date --date "-13 hours ago" +%m%Y`
c=`date --date "-13 hours ago" +%Y`
d=`date --date "-13 hours ago" +%b`
e="http://clists.nic.in/ddir/PDFCauselists/kerala/$c/$d/"
f="013$a$b.pdf"
g="$e$f"
h=`curl -s -o /dev/null -w "%{response_code}" $g`
if [ $h == '200' ] && [ ! -f $f ]
then
	echo "Done" > $f
	cd data
	wget $g
	pdf2txt -t text -o cl.txt $f
	wget $infoURL
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
	#https://smsapi.runacorp.com/restapi/sms/1/text/multi
	echo "Done."
fi
