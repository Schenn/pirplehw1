const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const http = require("http");
const https = require("https");

/**
 * Handles the response end for an http connection.
 */
class Server {
  constructor(routes){
    this.routes = routes;
    this._ = Symbol("server");
    this[this._] = {
      path: '',
      method: '',
      query: '',
      headers: '',
      buffer: '',
      decoder: new StringDecoder('utf-8')
    };
  }

  get path(){
    return this[this._].path;
  }

  get method(){
    return this[this._].method;
  }

  get query(){
    return this[this._].query;
  }

  get headers(){
    return this[this._].headers;
  }

  createServer(httpsOptions = null){
    this.server = (httpsOptions == null) ?
        http.createServer(this.handle.bind(this)) :
        https.createServer(httpsOptions, this.handle.bind(this))
  }

  buffer(data){
    this[this._].buffer += this[this._].decoder.write(data)
  }

  end(req, res){
    this[this._].buffer += this[this._].decoder.end();

    let routeHandle = typeof(this.routes[this.path]) !== "undefined" ?
        this.routes[this.path] :
        this.notFound.bind(this);

    let data = {
      'path': this.path,
      'query': this.query,
      'method': this.method,
      'headers': this.headers,
      'payload': this[this._].buffer
    };

    if(routeHandle.type === 'json') {
      routeHandle.handle(data, (status = 200, payload = {}) => {
        let paydata = JSON.stringify(payload);
        // set header must be called before write-head, otherwise error
        res.setHeader('content-type', 'application/json');
        res.writeHead(status);
        res.end(paydata);
      });
    } else {
      routeHandle.handle(data, (status=200, payload='') =>{
        res.writeHead(status);
        res.end(payload);
      });
    }
  }

  handle(req, res){
// Get the request's path from the request's url string
    // true argument tells parse function to collect the query string as a query object
    let parsed = url.parse(req.url, true);
    this[this._].path = parsed.pathname.replace(/^\/+|\/+$/g , '');
    this[this._].method = req.method;
    this[this._].query = parsed.query;
    this[this._].headers = req.headers;

    // Paydata (form-data), is read as a bitstream
    // Asynchronous Stream reading, have to wait for the end of the stream before you can return a response to the user.
    //  data event is triggered as the request parses some amount of data.
    //  If there's no paydata, the 'data' event is never triggered. However, the 'end' event is.
    // That content is cached in the buffer variable above, until the end event occurs.
    //  the end event is triggered when the end of the payload string is reached.
    //  If there is no payload string, the event is triggered immediately.
    req.on('data', (data)=>{
      this.buffer(data);
    });
    req.on('end',()=>{
      this.end(req, res);
    });
  }

  listen(env){
    this.server.listen(env.port, ()=>{
      console.log(`The server: environment: ${env.env} is listening on port ${env.port}`);
    });
  }

  notFound(data, cb){
    cb(404);
  }
}

// This is literally all it takes to create a node server and url parser.
// After this, its just about routing to the appropriate controllers
// So... Easy
// Think of this callback as the content of index.php
/**
 * Create a server and provide it with a request handling callback
 */
module.exports = Server;