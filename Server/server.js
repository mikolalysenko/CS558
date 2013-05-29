var http = require("http"); 
var vm = require("vm");

var reqCb = function(req, res)
{

	//callback everytime a request is issued
	
	//parse request header
	var reqHeader = req.headers; //header object
	if(req.method.localeCompare("GET") == 0)
	{
		//TODO
		console.log("got GET");
		res.end()
		return;
	}

	console.log(req.method);
	if(req.method.localeCompare("OPTIONS") == 0)
	{
		res.writeHead(200, 
				{
					"Content-Length" : 0,
					"Content-Type": "text/plain",
					"Allow": "GET, POST",
					"Access-Control-Allow-Origin" : "*",
					"Access-Control-Allow-Headers": "Content-Type",
					"Access-Control-Allow-Methods": "GET, POST"
				}
		);
		console.log("Sent OPTIONS response");
		res.end();
	}
	
	//expecting to receive a javascript program to eval
	if(req.method.localeCompare("POST") == 0)
	{
		var body = "";
		req.on("data", function(chunk) 
				{
					body += chunk; //we expect text
				}
		);
		req.on("end", function()
				{
					var outStr = "";
					try
					{
						outStr = vm.runInNewContext(String(body));
					}
					catch(e)
					{
						outStr = String(e);
					}
					res.writeHead(200, 
							{
								//"Content-Length" : body.length,
								"Content-Length" : Buffer.byteLength(String(outStr)),
								"Content-Type": "text/plain",
								"Allow": "GET, POST",
								"Access-Control-Allow-Origin" : "*",
								"Access-Control-Allow-Headers": "Content-Type",
								"Access-Control-Allow-Methods": "GET, POST"
							}
					);
					//console.log("Received body: " + body + "\n Output: " + comp());
					res.end(String(outStr)); //fire
				}
		);
	}
}

var server = http.createServer(reqCb);
server.listen(8080);
