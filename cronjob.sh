rm -R data/*
a=`date --date "-5 hours ago" +%d`
b=`date --date "-5 hours ago" +%m%Y`
c=`date --date "-5 hours ago" +%Y`
d=`date --date "-5 hours ago" +%b`
#let a++
e="http://clists.nic.in/ddir/PDFCauselists/kerala/$c/$d/"
f="013$a$b.pdf"
g="$e$f"
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

