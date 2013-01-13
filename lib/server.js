
var server = function (CONF, cb) {
  var net = require('net')
  	,	format = require('util').format
  	,	MongoClient = require('mongodb').MongoClient
  	, msgpack = require('msgpack')
  	,	LogsProvider = require('irclog-provider')
  	,	server, ms
  	, logsProv = new LogsProvider(CONF.db.host, CONF.db.port, CONF.db.user, CONF.db.password);

  server = net.createServer(function(socket) { //'connection' listener
    console.log('server connected');
    
    socket.on('end', function() {
      console.log('server disconnected');
    });

    ms = new msgpack.Stream(socket);
    ms.on('msg', function (msg) {
    	console.time();
    	console.log(msg);
    	logsProv.save(msg.channel, msg, function (err, result) { 
    		if (err) {
    			console.error(' There was an error with the last message arrived\n', err);
    		}
    		console.timeEnd()
    	});
  	});

    if (typeof cb === 'funciton') {
      ms.on('msg', cb);
    }

  }).on('error', function (err) {
  	console.error(' There was an error with the tcp server\n', err);
  });

  server.listen(CONF.tcpServer.port, CONF.tcpServer.host, function() { //'listening' listener
    console.log('server bound');
  });
}

if (require.main === module) {
  var c = require('config')
  server(c);
} else {
  module.exports.startTCPServer = server;
}


/*
{ 
	_id:"channel1", 
	logs: [
		{ day: 'Mon Jun 7 2013'
		,	mesages: [{ hour: "10:03", event:"join", nick:"..", host:"..." }, { hour: "" ... }, ... ] }
	]
}

*/