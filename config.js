const environments = {
  dev: {
    port: 3000,
    https: {
      port: 3001,
      key: './https/key.pem',
      cert: './https/cert.pem'
    },
    env: 'dev',
  },
  staging: {
    port: 5000,
    https: {
      port: 5001,
      key: './https/key.pem',
      cert: './https/cert.pem'
    },
    env: 'staging'
  },
  production: {
    port: 80,
    https: {
      port: 443,
      key: './https/key.pem',
      cert: './https/cert.pem'
    },
    env: 'prod'
  }
};


let env = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : 'dev';
let currentEnv = typeof(environments[env]) !== "undefined" ? environments[env] : environments.dev;

module.exports = currentEnv;