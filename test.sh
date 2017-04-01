$path="/home/ubuntu/Scrapper"
rm -R "$path/data"
mkdir "$path/data"
mkdir "$pathlog"
host="http://klawj.tk"

while true
do
echo `curl $host/smsapi/job`
sleep 5
done

