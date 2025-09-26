import { describe, it, expect } from 'vitest';
import { GetLaundry } from '@/api/laundry';

describe('GetLaundry - Real API Test', () => {
  it('successfully fetch laundry', async () => {
    const payload = {
      positionId: 27958,
      categoryCode: '00',
      page: 1,
      floorCode: '08',
      pageSize: 10
    };

    const response = await GetLaundry(payload);
    // console.log('API Response:', JSON.stringify(response, null, 2));
    expect(response).toBeDefined();
    expect(response.code).toBe(0);
    expect(response.message).toBe('success');
    expect(response.data).toHaveProperty('items');
    expect(Array.isArray(response.data.items)).toBe(true);

    if (response.data.items.length > 0) {
      const firstItem = response.data.items[0];
      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('name');
      expect(firstItem).toHaveProperty('imei');
    }
  }, 1000);
});
