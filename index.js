const env = require("./config");
const Server = require("./Server");
const fs = require("fs");

/**
 * Handlers for HTTP Routes
 * @type {{hello: httpHandlers.hello, ping: httpHandlers.ping}}
 */
const httpHandlers = {
  hello: (data, cb)=>{
    /**
     * Homework explicitly states that the 'hello' route should be POSTED to.
     *
     *  If the route was POSTED, return a success 'hello world' message.
     *  Otherwise, return a 500 and an error message.
     *
     */
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

/**
 * Router for HTTP and HTTPS Routes
 *  Provides the handle to use and the type of response to return. (Only handles JSON or plain text at the moment)
 *
 * @type {{hello: {handle: httpHandlers.hello, type: string}, ping: {handle: httpHandlers.ping}}}
 */
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

/**
 * Create polymorphic objects to wrap listen options
 *
 * @type {{port: number, env: string}}
 */
const httpEnv = {
  port: env.port,
  env: env.env
};

const httpsEnv = {
  port: env.https.port,
  env: env.env,
};

/**
 * Create a Server for http routes
 *
 * @type {Server}
 */
let httpServer = new Server(httpRouter);
httpServer.createServer();
httpServer.listen(httpEnv);

/**
 * Create a Server for https routes
 *
 * @type {Server}
 */
let httpsServer = new Server(httpsRouter);
httpsServer.createServer({
  'key': fs.readFileSync(env.https.key),
  'cert': fs.readFileSync(env.https.cert)
});
httpsServer.listen(httpsEnv);