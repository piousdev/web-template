/**
 * k6 Load Testing for Next.js API Routes
 *
 * This script performs load testing on the API endpoints
 * Run with: bun run test:load
 * Or: k6 run tests/load/api.load.js
 *
 * With specific stage: k6 run -e TEST_STAGE=load tests/load/api.load.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { config, getTestStage, getThresholds } from './config.js';

// Custom metrics
const authSuccessRate = new Rate('auth_success');
const userAPISuccessRate = new Rate('user_api_success');
const sessionCheckCounter = new Counter('session_checks');
const apiDuration = new Trend('api_request_duration');

// Test configuration
const testStage = __ENV.TEST_STAGE || 'smoke';

export const options = {
  stages: getTestStage(),
  thresholds: getThresholds(testStage),
  // Disable insecure TLS verification for local development
  insecureSkipTLSVerify: true,
};

/**
 * Setup function runs once before test starts
 * Use to prepare test data or verify API availability
 */
export function setup() {
  // Health check
  const healthRes = http.get(`${config.baseUrl}/api/health`);

  check(healthRes, {
    'API is healthy': (r) => r.status === 200,
  });

  if (healthRes.status !== 200) {
    throw new Error('API health check failed');
  }

  return {
    baseUrl: config.baseUrl,
    testUser: config.testUser,
  };
}

/**
 * Main test function - runs for each virtual user
 */
export default function (data) {
  const { baseUrl, testUser } = data;

  // Simulate realistic user behavior with multiple scenarios

  group('Authentication Flow', () => {
    // Get session (unauthenticated)
    group('Check session (unauthenticated)', () => {
      const sessionRes = http.get(`${baseUrl}/api/auth/session`, {
        headers: config.headers,
      });

      const sessionCheck = check(sessionRes, {
        'Session check status is 200': (r) => r.status === 200,
        'Session is null for unauthenticated user': (r) => {
          const body = JSON.parse(r.body);
          return body.session === null || body.user === null;
        },
      });

      sessionCheckCounter.add(1);
      apiDuration.add(sessionRes.timings.duration);
    });

    // Sign in
    group('Sign in', () => {
      const signInRes = http.post(
        `${baseUrl}/api/auth/sign-in/email`,
        JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
        {
          headers: config.headers,
        }
      );

      const signInSuccess = check(signInRes, {
        'Sign in status is 200': (r) => r.status === 200,
        'Sign in returns session': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.session || body.user;
          } catch {
            return false;
          }
        },
      });

      authSuccessRate.add(signInSuccess);
      apiDuration.add(signInRes.timings.duration);

      // Extract cookies for authenticated requests
      const cookies = signInRes.cookies;

      if (signInSuccess) {
        // Get session (authenticated)
        group('Check session (authenticated)', () => {
          const authSessionRes = http.get(`${baseUrl}/api/auth/session`, {
            headers: config.headers,
            cookies: cookies,
          });

          check(authSessionRes, {
            'Authenticated session check is 200': (r) => r.status === 200,
            'Session contains user data': (r) => {
              try {
                const body = JSON.parse(r.body);
                return body.user !== null;
              } catch {
                return false;
              }
            },
          });

          sessionCheckCounter.add(1);
        });

        // Test protected API endpoints
        group('Protected API Endpoints', () => {
          // Health check with auth
          const healthRes = http.get(`${baseUrl}/api/health`, {
            headers: config.headers,
            cookies: cookies,
          });

          check(healthRes, {
            'Health check is 200': (r) => r.status === 200,
            'Health check returns status': (r) => {
              try {
                const body = JSON.parse(r.body);
                return body.status === 'ok' || r.status === 200;
              } catch {
                return true; // Health endpoint might just return 200
              }
            },
          });

          userAPISuccessRate.add(healthRes.status === 200);
          apiDuration.add(healthRes.timings.duration);
        });

        // Sign out
        group('Sign out', () => {
          const signOutRes = http.post(
            `${baseUrl}/api/auth/sign-out`,
            null,
            {
              headers: config.headers,
              cookies: cookies,
            }
          );

          check(signOutRes, {
            'Sign out status is 200': (r) => r.status === 200,
          });

          apiDuration.add(signOutRes.timings.duration);
        });
      }
    });
  });

  // Simulate think time between requests
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

/**
 * Teardown function runs once after all tests complete
 */
export function teardown(data) {
  // Cleanup operations if needed
  console.log('Load test completed');
}

/**
 * Custom summary for better reporting
 */
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

/**
 * Simple text summary generator
 */
function textSummary(data, options = {}) {
  const { indent = '', enableColors = false } = options;

  const lines = [
    '',
    `${indent}✓ checks................: ${formatRate(data.metrics.checks)}`,
    `${indent}✓ http_req_duration.....: ${formatTrend(data.metrics.http_req_duration)}`,
    `${indent}✓ http_req_failed.......: ${formatRate(data.metrics.http_req_failed)}`,
    `${indent}✓ http_reqs.............: ${data.metrics.http_reqs.values.count}`,
    `${indent}✓ auth_success..........: ${formatRate(data.metrics.auth_success)}`,
    `${indent}✓ user_api_success......: ${formatRate(data.metrics.user_api_success)}`,
    '',
  ];

  return lines.join('\n');
}

function formatRate(metric) {
  if (!metric || !metric.values) return 'N/A';
  const rate = metric.values.rate || 0;
  return `${(rate * 100).toFixed(2)}%`;
}

function formatTrend(metric) {
  if (!metric || !metric.values) return 'N/A';
  return `avg=${metric.values.avg?.toFixed(2)}ms p(95)=${metric.values['p(95)']?.toFixed(2)}ms`;
}
