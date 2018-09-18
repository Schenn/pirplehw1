const env = require("./config");
const Server = require("./Server");
const fs = require("fs");

const httpHandlers = {
  hello: (data, cb)=>{
    if(data.method === 'POST'){
      cb(406, {'response': 'Hello Pirple! Homework Assignment #1', 'postdata': data.query});
    } else {
      cb(500, {'error': 'You must POST data to the hello route, not GET'})
    }
  },
  ping: (data, cb)=>{
    cb(200);
  }
};

const httpRouter = {
  'hello': {
    handle: httpHandlers.hello,
    type: 'json'
  },
  'ping': {
    handle: httpHandlers.ping,
  }
};

const httpsRouter = {
  'ping': {
    handle: httpHandlers.ping
  }
};

const httpEnv = {
  port: env.port,
  env: env.env
};

const httpsEnv = {
  port: env.https.port,
  env: env.env,
};


let httpServer = new Server(httpRouter);
httpServer.createServer();
httpServer.listen(httpEnv);

let httpsServer = new Server(httpsRouter);
httpsServer.createServer({
  'key': fs.readFileSync(env.https.key),
  'cert': fs.readFileSync(env.https.cert)
});

httpsServer.listen(httpsEnv);