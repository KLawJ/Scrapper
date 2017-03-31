var request = require('request');

		request.post(
		    'http://api.textlocal.in/send/',
		    { form: { 
		    	apikey:"P58E8LiYUjk-82Au08j9odXTkIs9nvpdra9bb3468b",
				username:"textlocal@runacorp.com",
				message:"hello",
				numbers:"9020508050"
		    	}
		    },
		    function (error, response, body) {
		        if (!error && response.statusCode == 200) {
		            console.log(body)
		        }
		    }
		);