// tests/e2e/needsAPI.spec.ts
// E2E API tests for needs posting and engagement endpoints

import { test, expect } from '@playwright/test';

test.describe('Needs Posting API E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any necessary test environment
    await page.goto('/');
  });

  test('should handle /api/needs endpoint without authentication', async ({ page }) => {
    // Test unauthenticated POST to /api/needs (not /api/needs/new)
    const response = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/needs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Test Need',
            area: 'test-area',
            summary: 'Test summary',
            body: 'Test description'
          }),
        });

        return {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: await response.text()
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Should return 401 Unauthorized for unauthenticated requests
    expect(response.status).toBe(401);
    
    // Response should be JSON, not HTML error page
    const contentType = response.headers['content-type'] || '';
    expect(contentType).toContain('application/json');
    
    // Parse response body
    let responseData;
    try {
      responseData = JSON.parse(response.body);
    } catch (e) {
      console.error('Failed to parse response body as JSON:', response.body);
      throw e;
    }
    
    expect(responseData).toHaveProperty('error');
    expect(typeof responseData.error).toBe('string');
  });

  test('should handle /api/needs with invalid data', async ({ page }) => {
    // Test POST to /api/needs with invalid data
    const response = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/needs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Missing required title field
            title: '',
            body: 'Some description'
          }),
        });

        return {
          status: response.status,
          body: await response.text()
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Should return 400 Bad Request or 401 Unauthorized
    expect([400, 401]).toContain(response.status);
  });

  test('should handle GET /api/needs endpoint', async ({ page }) => {
    // Test GET to /api/needs (public endpoint)
    const response = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/needs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: await response.text()
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Should return 200 OK
    expect(response.status).toBe(200);
    
    // Response should be JSON
    const contentType = response.headers['content-type'] || '';
    expect(contentType).toContain('application/json');
    
    // Should return an object with needs array
    let responseData;
    try {
      responseData = JSON.parse(response.body);
    } catch (e) {
      console.error('Failed to parse response body as JSON:', response.body);
      throw e;
    }
    
    // API returns { needs: [...] } not a direct array
    expect(responseData).toHaveProperty('needs');
    expect(Array.isArray(responseData.needs)).toBe(true);
  });
});

test.describe('Needs Engagement API E2E Tests', () => {
  let testNeedId: string;

  test.beforeAll(async ({ request }) => {
    // Get a test need ID to work with
    const response = await request.get('/api/needs');
    const needs = await response.json();
    
    // API returns { needs: [...] }
    const needsList = needs.needs || needs;
    if (Array.isArray(needsList) && needsList.length > 0) {
      testNeedId = needsList[0].id;
    } else {
      // If no needs exist, we'll skip engagement tests
      testNeedId = 'no-needs-available';
    }
  });

  test('should handle anonymous engagement with interest', async ({ page }) => {
    if (testNeedId === 'no-needs-available') {
      test.skip('No needs available for testing engagement');
      return;
    }

    const response = await page.evaluate(async (needId) => {
      try {
        const response = await fetch(`/api/needs/${needId}/engagement`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kind: 'interest'
          }),
        });

        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: await response.text()
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, testNeedId);

    // Should return 200 OK for anonymous interest
    expect([200, 201]).toContain(response.status);
    
    // Response should be JSON
    const contentType = response.headers['content-type'] || '';
    expect(contentType).toContain('application/json');
    
    let responseData;
    try {
      responseData = JSON.parse(response.body);
    } catch (e) {
      console.error('Failed to parse response body as JSON:', response.body);
      throw e;
    }
    
    expect(responseData).toHaveProperty('success');
    expect(responseData.success).toBe(true);
    expect(responseData).toHaveProperty('kind', 'interest');
    expect(responseData).toHaveProperty('anonymous', true);
  });

  test('should reject anonymous pledge', async ({ page }) => {
    if (testNeedId === 'no-needs-available') {
      test.skip('No needs available for testing engagement');
      return;
    }

    const response = await page.evaluate(async (needId) => {
      try {
        const response = await fetch(`/api/needs/${needId}/engagement`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kind: 'pledge'
          }),
        });

        return {
          status: response.status,
          body: await response.text()
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, testNeedId);

    // Should return 400 Bad Request for anonymous pledge
    expect(response.status).toBe(400);
    
    let responseData;
    try {
      responseData = JSON.parse(response.body);
    } catch (e) {
      console.error('Failed to parse response body as JSON:', response.body);
      throw e;
    }
    
    expect(responseData).toHaveProperty('error');
    expect(responseData.error).toContain('Anonymous users can only express interest');
  });

  test('should get engagement summary', async ({ page }) => {
    if (testNeedId === 'no-needs-available') {
      test.skip('No needs available for testing engagement');
      return;
    }

    const response = await page.evaluate(async (needId) => {
      try {
        const response = await fetch(`/api/needs/${needId}/engagement/summary`, {
          method: 'GET',
        });

        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: await response.text()
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, testNeedId);

    // Should return 200 OK
    expect(response.status).toBe(200);
    
    // Response should be JSON
    const contentType = response.headers['content-type'] || '';
    expect(contentType).toContain('application/json');
    
    let responseData;
    try {
      responseData = JSON.parse(response.body);
    } catch (e) {
      console.error('Failed to parse response body as JSON:', response.body);
      throw e;
    }
    
    // Verify response structure according to CLAUDE.md
    expect(responseData).toHaveProperty('need_id', testNeedId);
    expect(responseData).toHaveProperty('need_title');
    expect(responseData).toHaveProperty('interest_users');
    expect(responseData).toHaveProperty('pledge_users');
    expect(responseData).toHaveProperty('anon_interest_today');
    expect(responseData).toHaveProperty('anon_interest_total');
    expect(responseData).toHaveProperty('total_engagement');
    expect(responseData).toHaveProperty('breakdown');
    
    // Verify data types
    expect(typeof responseData.interest_users).toBe('number');
    expect(typeof responseData.pledge_users).toBe('number');
    expect(typeof responseData.anon_interest_today).toBe('number');
    expect(typeof responseData.anon_interest_total).toBe('number');
    expect(typeof responseData.total_engagement).toBe('number');
    
    expect(responseData.breakdown).toHaveProperty('authenticated');
    expect(responseData.breakdown).toHaveProperty('anonymous');
  });

  test('should handle engagement with non-existent need', async ({ page }) => {
    const fakeNeedId = '00000000-0000-0000-0000-000000000000';
    
    const response = await page.evaluate(async (needId) => {
      try {
        const response = await fetch(`/api/needs/${needId}/engagement`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kind: 'interest'
          }),
        });

        return {
          status: response.status,
          body: await response.text()
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, fakeNeedId);

    // Should return 404 Not Found
    expect(response.status).toBe(404);
    
    let responseData;
    try {
      responseData = JSON.parse(response.body);
    } catch (e) {
      console.error('Failed to parse response body as JSON:', response.body);
      throw e;
    }
    
    expect(responseData).toHaveProperty('error', 'Need not found');
  });

  test('should handle invalid engagement kind', async ({ page }) => {
    if (testNeedId === 'no-needs-available') {
      test.skip('No needs available for testing engagement');
      return;
    }

    const response = await page.evaluate(async (needId) => {
      try {
        const response = await fetch(`/api/needs/${needId}/engagement`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kind: 'invalid-kind'
          }),
        });

        return {
          status: response.status,
          body: await response.text()
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, testNeedId);

    // Should return 400 Bad Request
    expect(response.status).toBe(400);
    
    let responseData;
    try {
      responseData = JSON.parse(response.body);
    } catch (e) {
      console.error('Failed to parse response body as JSON:', response.body);
      throw e;
    }
    
    expect(responseData).toHaveProperty('error');
    expect(responseData.error).toContain('Invalid request body');
  });
});

test.describe('API Response Format Validation', () => {
  test('should not return HTML error pages for API endpoints', async ({ page }) => {
    const apiEndpoints = [
      '/api/needs',
      '/api/needs/00000000-0000-0000-0000-000000000000/engagement',
      '/api/needs/00000000-0000-0000-0000-000000000000/engagement/summary'
    ];
    
    for (const endpoint of apiEndpoints) {
      const response = await page.evaluate(async (url) => {
        try {
          const response = await fetch(url, {
            method: url.includes('/engagement') && !url.includes('/summary') ? 'POST' : 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            body: url.includes('/engagement') && !url.includes('/summary') ? 
              JSON.stringify({ kind: 'interest' }) : undefined,
          });

          return {
            url,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body: await response.text()
          };
        } catch (error) {
          return {
            url,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }, endpoint);

      // Verify we don't get HTML error pages
      const contentType = response.headers?.['content-type'] || '';
      const body = response.body || '';
      
      expect(contentType).not.toContain('text/html');
      expect(body).not.toContain('<!DOCTYPE html>');
      expect(body).not.toContain('<html>');
      
      // Should be JSON for API endpoints
      expect(contentType).toContain('application/json');
    }
  });
});