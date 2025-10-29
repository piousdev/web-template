/**
 * k6 Load Testing Configuration
 *
 * This file contains configuration settings for load tests
 */

export const config = {
  // Base URL for the API
  baseUrl: __ENV.BASE_URL || 'http://localhost:3000',

  // Test credentials
  testUser: {
    email: __ENV.TEST_USER_EMAIL || 'load-test@example.com',
    password: __ENV.TEST_USER_PASSWORD || 'LoadTest123!',
  },

  // Load test stages
  stages: {
    // Smoke test - minimal load
    smoke: [
      { duration: '1m', target: 1 }, // 1 user for 1 minute
    ],

    // Load test - normal expected load
    load: [
      { duration: '2m', target: 10 }, // Ramp up to 10 users
      { duration: '5m', target: 10 }, // Stay at 10 users
      { duration: '2m', target: 0 },  // Ramp down to 0
    ],

    // Stress test - beyond normal load
    stress: [
      { duration: '2m', target: 20 },  // Ramp up to 20 users
      { duration: '5m', target: 20 },  // Stay at 20 users
      { duration: '3m', target: 50 },  // Spike to 50 users
      { duration: '2m', target: 20 },  // Return to 20 users
      { duration: '2m', target: 0 },   // Ramp down to 0
    ],

    // Spike test - sudden traffic spike
    spike: [
      { duration: '1m', target: 10 },   // Normal load
      { duration: '30s', target: 100 }, // Sudden spike
      { duration: '1m', target: 10 },   // Return to normal
      { duration: '1m', target: 0 },    // Ramp down
    ],

    // Soak test - sustained load over time
    soak: [
      { duration: '2m', target: 10 },  // Ramp up
      { duration: '30m', target: 10 }, // Sustained load
      { duration: '2m', target: 0 },   // Ramp down
    ],
  },

  // Performance thresholds
  thresholds: {
    // HTTP errors should be less than 1%
    http_req_failed: ['rate<0.01'],

    // 95% of requests should complete within 500ms
    http_req_duration: ['p(95)<500'],

    // 99% of requests should complete within 1000ms
    'http_req_duration{expected_response:true}': ['p(99)<1000'],

    // Requests per second should be above minimum
    http_reqs: ['rate>10'],

    // Check pass rate should be above 95%
    checks: ['rate>0.95'],
  },

  // Request headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Get test stage based on environment variable
 * Usage: k6 run -e TEST_STAGE=load tests/load/api.load.js
 */
export function getTestStage() {
  const stage = __ENV.TEST_STAGE || 'smoke';
  return config.stages[stage] || config.stages.smoke;
}

/**
 * Get thresholds based on test type
 */
export function getThresholds(type = 'default') {
  if (type === 'smoke') {
    return {
      http_req_failed: ['rate<0.01'],
      http_req_duration: ['p(95)<1000'], // More lenient for smoke test
    };
  }

  if (type === 'stress' || type === 'spike') {
    return {
      http_req_failed: ['rate<0.05'], // Allow more errors under stress
      http_req_duration: ['p(95)<2000'], // More lenient response time
      checks: ['rate>0.90'], // Allow more check failures
    };
  }

  return config.thresholds;
}
