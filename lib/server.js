
function (CONF, cb) {
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
  var path = require('path')
  , fs = require('fs')
  , conf_path, content;
  
  if (process.argv[2]) {
    conf_path = path.resolve(process.argv[2]);
    content = fs.readFileSync(conf_path, 'utf8');
  } else {
    paths = [
      'bot.json'
    , process.env.NODE_ENV || 'development.json'
    ];
    for (var i = 0, len = paths.length; i < len; ++i)
      paths.push('./config/' + paths[i]);
    for (var f = false, i = 0, len = paths.length; !f && i < len; ++i)
      try {
        content = fs.readFileSync(paths[i], 'utf8');
        f = true;
      } catch (e) {}
    if (!content) 
      throw " Configuration file not found";
  }
  
  server(JSON.parse(content));
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