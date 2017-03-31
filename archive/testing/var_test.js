var deliveryMode = process.argv[3];
deliveryMode.split(',').forEach(function (item, index){
	console.log(item);
});