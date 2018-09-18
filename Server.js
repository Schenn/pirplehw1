const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const http = require("http");
const https = require("https");

/**
 * Server connects requests to the routes provided at construction.
 *
 *  Provides public getters for the path, method, query, and headers of the request
 *  Provides a notfound callback for when a route is not matched.
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

  /**
   * The request path with leading and trailing slashes removed.
   * @return {string}
   */
  get path(){
    return this[this._].path;
  }

  /**
   * The requests method
   * @return {string}
   */
  get method(){
    return this[this._].method;
  }

  /**
   * The requests parsed query Object
   * @return {Object|string|null}
   */
  get query(){
    return this[this._].query;
  }

  /**
   * The request's headers.
   * @return {*|string|Headers|string|HeadersInit}
   */
  get headers(){
    return this[this._].headers;
  }

  /**
   * Create a new http or https server.
   *
   *  Default is http server.
   *  Provide HTTPS options to use HTTPS instead.
   *
   * @param {{key: {string}, cert: {string}}} httpsOptions
   *    key and cert values should be the path to the key and cert .pem files.
   */
  createServer(httpsOptions = null){
    this.server = (httpsOptions == null) ?
        http.createServer(this.handle.bind(this)) :
        https.createServer(httpsOptions, this.handle.bind(this))
  }

  /**
   * Cache the latest burst from the payload parsing stream.
   *
   * @param {object} data
   */
  buffer(data){
    this[this._].buffer += this[this._].decoder.write(data)
  }

  /**
   * The request has finished processing it's payload and is ready to return the final response.
   *
   *  Calls the route handler for the provided path
   *      (or Server.notfound if the path was not provided)
   *
   *  Closes the Response with the payload content for the client.
   *
   * @param {object} req
   * @param {ServerResponse} res
   */
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

    /**
     * If the route expects a json return value,
     *  then set the appropriate headers and stringify the paydata before closing the response.
     *
     * Otherwise, just close the response with the provided paydata.
     * @todo Handle other "content-types"
     */
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

  /**
   * Start processing the client's request.
   *
   * @param {object} req
   * @param {ServerResponse} res
   */
  handle(req, res){
    // Get the request's path from the request's url string
    // true argument tells parse function to collect the query string as a query object
    let parsed = url.parse(req.url, true);
    this[this._].path = parsed.pathname.replace(/^\/+|\/+$/g , '');
    this[this._].method = req.method;
    this[this._].query = parsed.query;
    this[this._].headers = req.headers;

    /** Paydata (form-data), is read as a bitstream
    * Asynchronous Stream reading, have to wait for the end of the stream before you can return a response to the user.
    *  data event is triggered as the request parses some amount of data.
    *  If there's no paydata, the 'data' event is never triggered. However, the 'end' event is.
    * That content is cached in the buffer variable above, until the end event occurs.
    *  the end event is triggered when the end of the payload string is reached.
    *  If there is no payload string, the event is triggered immediately.
    */

    req.on('data', (data)=>{
      this.buffer(data);
    });
    req.on('end',()=>{
      this.end(req, res);
    });
  }

  /**
   * Tell the connected http or https server to begin listening to the provided port.
   *
   * @param {{port: {string}, env: {string}}} env
   */
  listen(env){
    this.server.listen(env.port, ()=>{
      console.log(`The server: environment: ${env.env} is listening on port ${env.port}`);
    });
  }

  /**
   * The requested route was not found.  Return 404.
   *
   * @param {object} data
   * @param {function} cb
   */
  notFound(data, cb){
    cb(404);
  }
}

module.exports = Server;