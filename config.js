/**
 * Prepare default environment variables
 * @type {{dev: {port: number, https: {port: number, key: string, cert: string}, env: string}, staging: {port: number, https: {port: number, key: string, cert: string}, env: string}, production: {port: number, https: {port: number, key: string, cert: string}, env: string}}}
 */
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

// If the environment value isn't found, use the dev environment.
let env = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : 'dev';
// Don't return a missing environment, if the provided environment string was not found, default back to the dev environment.
let currentEnv = typeof(environments[env]) !== "undefined" ? environments[env] : environments.dev;

module.exports = currentEnv;