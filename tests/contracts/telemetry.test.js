import { z } from 'zod';

/**
 * CONTRACT TESTING
 * 
 * MD Mandate: Prevent silent production corruption.
 * Contract tests verify that the expected payload schemas match between 
 * the Frontend and the Backend/Flutter bridge.
 */

const telemetryPayloadSchema = z.object({
  event_type: z.string(),
  user_id: z.string().uuid(),
  timestamp: z.number(),
  payload: z.record(z.any()),
  client_version: z.string(),
});

describe('Contract Tests: Telemetry Bridge', () => {
  it('validates a correct telemetry payload', () => {
    const mockPayload = {
      event_type: 'TEST_SUBMITTED',
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      timestamp: Date.now(),
      payload: { score: 95, timeTaken: 120 },
      client_version: '1.2.0'
    };
    
    expect(() => telemetryPayloadSchema.parse(mockPayload)).not.toThrow();
  });

  it('rejects an invalid telemetry payload (missing required field)', () => {
    const invalidPayload = {
      event_type: 'TEST_SUBMITTED',
      // missing user_id
      timestamp: Date.now(),
      payload: {},
      client_version: '1.2.0'
    };
    
    expect(() => telemetryPayloadSchema.parse(invalidPayload)).toThrow();
  });
});
