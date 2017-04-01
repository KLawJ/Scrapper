$path="/home/ubuntu/Scrapper"
host="http://klawj.tk"

while true
do
echo `curl $host/smsapi/job`
sleep 5
done

