#!/usr/bin/env node

/**
 * Docker health check script for Bassquake
 * Tests if the application is responding correctly
 */

const http = require('http');
const { execSync } = require('child_process');

const HOST = process.env.HEALTHCHECK_HOST || 'localhost';
const PORT = process.env.HEALTHCHECK_PORT || '5173';
const TIMEOUT = parseInt(process.env.HEALTHCHECK_TIMEOUT || '5000');

// Health check configuration
const healthChecks = [
  {
    name: 'HTTP Server',
    check: () => httpHealthCheck(HOST, PORT),
  },
  {
    name: 'Node.js Process',
    check: () => processHealthCheck(),
  },
  {
    name: 'Memory Usage',
    check: () => memoryHealthCheck(),
  },
];

/**
 * HTTP health check
 */
function httpHealthCheck(host, port) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: '/',
      method: 'GET',
      timeout: TIMEOUT,
    };

    const req = http.request(options, res => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        resolve(`HTTP server responding with status ${res.statusCode}`);
      } else {
        reject(`HTTP server returned status ${res.statusCode}`);
      }
    });

    req.on('error', err => {
      reject(`HTTP request failed: ${err.message}`);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(`HTTP request timed out after ${TIMEOUT}ms`);
    });

    req.end();
  });
}

/**
 * Process health check
 */
function processHealthCheck() {
  return new Promise((resolve, reject) => {
    try {
      const pid = process.pid;
      const uptime = Math.floor(process.uptime());
      resolve(`Node.js process ${pid} running for ${uptime}s`);
    } catch (err) {
      reject(`Process check failed: ${err.message}`);
    }
  });
}

/**
 * Memory usage health check
 */
function memoryHealthCheck() {
  return new Promise((resolve, reject) => {
    try {
      const usage = process.memoryUsage();
      const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
      const totalMB = Math.round(usage.heapTotal / 1024 / 1024);

      // Alert if memory usage is above 80%
      const usagePercent = (usedMB / totalMB) * 100;

      if (usagePercent > 80) {
        reject(`High memory usage: ${usedMB}MB/${totalMB}MB (${usagePercent.toFixed(1)}%)`);
      } else {
        resolve(`Memory usage: ${usedMB}MB/${totalMB}MB (${usagePercent.toFixed(1)}%)`);
      }
    } catch (err) {
      reject(`Memory check failed: ${err.message}`);
    }
  });
}

/**
 * Run all health checks
 */
async function runHealthChecks() {
  console.log(`🏥 Running health checks for Bassquake (${new Date().toISOString()})`);

  let allPassed = true;
  const results = [];

  for (const healthCheck of healthChecks) {
    try {
      const result = await healthCheck.check();
      results.push(`✅ ${healthCheck.name}: ${result}`);
    } catch (error) {
      results.push(`❌ ${healthCheck.name}: ${error}`);
      allPassed = false;
    }
  }

  // Print all results
  results.forEach(result => console.log(result));

  if (allPassed) {
    console.log('\n🎉 All health checks passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some health checks failed!');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', err => {
  console.error('❌ Uncaught exception during health check:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  console.error('❌ Unhandled rejection during health check:', reason);
  process.exit(1);
});

// Run the health checks
if (require.main === module) {
  runHealthChecks();
}

module.exports = { runHealthChecks, httpHealthCheck, processHealthCheck, memoryHealthCheck };
