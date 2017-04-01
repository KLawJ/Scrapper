$path="/home/ubuntu/Scrapper"
host="http://klawj.tk"

while true
do
output=`curl -s $host/smsapi/jobs`
echo $output
sleep 5
done

