/**
 * Unit Tests for Data Cleaner Utility
 * Tests data validation and capping logic
 */

const {
  capPercentageFields,
  calculateWomenParticipation,
  cleanRecords,
  isValidPercentage,
} = require('./dataCleaner');

describe('capPercentageFields', () => {
  test('should cap percentage above 100 to 100', () => {
    const record = {
      payment_percentage_15_days: 150.5,
      district_name: 'Test District',
    };
    
    const capped = capPercentageFields(record);
    
    expect(capped.payment_percentage_15_days).toBe(100);
    expect(capped.district_name).toBe('Test District');
  });

  test('should cap percentage below 0 to 0', () => {
    const record = {
      payment_percentage_15_days: -25.3,
    };
    
    const capped = capPercentageFields(record);
    
    expect(capped.payment_percentage_15_days).toBe(0);
  });

  test('should not modify valid percentages', () => {
    const record = {
      payment_percentage_15_days: 75.5,
      percent_of_category_b_works: 50.0,
    };
    
    const capped = capPercentageFields(record);
    
    expect(capped.payment_percentage_15_days).toBe(75.5);
    expect(capped.percent_of_category_b_works).toBe(50.0);
  });

  test('should handle null and undefined values', () => {
    const record = {
      payment_percentage_15_days: null,
      percent_of_category_b_works: undefined,
      district_name: 'Test',
    };
    
    const capped = capPercentageFields(record);
    
    expect(capped.payment_percentage_15_days).toBeNull();
    expect(capped.percent_of_category_b_works).toBeUndefined();
    expect(capped.district_name).toBe('Test');
  });

  test('should set non-numeric percentage values to null', () => {
    const record = {
      payment_percentage_15_days: 'invalid',
    };
    
    const capped = capPercentageFields(record);
    
    expect(capped.payment_percentage_15_days).toBeNull();
  });

  test('should not mutate original record', () => {
    const record = {
      payment_percentage_15_days: 150.0,
    };
    
    const capped = capPercentageFields(record);
    
    expect(record.payment_percentage_15_days).toBe(150.0); // Original unchanged
    expect(capped.payment_percentage_15_days).toBe(100); // Capped version
  });

  test('should handle null input', () => {
    const capped = capPercentageFields(null);
    expect(capped).toBeNull();
  });
});

describe('calculateWomenParticipation', () => {
  test('should calculate correct percentage', () => {
    const record = {
      women_persondays: 5000,
      persondays_of_central_liability_so_far: 10000,
    };
    
    const percentage = calculateWomenParticipation(record);
    
    expect(percentage).toBe(50);
  });

  test('should cap result at 100', () => {
    const record = {
      women_persondays: 15000,
      persondays_of_central_liability_so_far: 10000,
    };
    
    const percentage = calculateWomenParticipation(record);
    
    expect(percentage).toBe(100);
  });

  test('should return null for division by zero', () => {
    const record = {
      women_persondays: 5000,
      persondays_of_central_liability_so_far: 0,
    };
    
    const percentage = calculateWomenParticipation(record);
    
    expect(percentage).toBeNull();
  });

  test('should handle null input', () => {
    const percentage = calculateWomenParticipation(null);
    expect(percentage).toBeNull();
  });

  test('should handle missing fields', () => {
    const record = {
      district_name: 'Test',
    };
    
    const percentage = calculateWomenParticipation(record);
    
    expect(percentage).toBeNull();
  });
});

describe('cleanRecords', () => {
  test('should clean array of records', () => {
    const records = [
      { payment_percentage_15_days: 150 },
      { payment_percentage_15_days: 75 },
      { payment_percentage_15_days: -10 },
    ];
    
    const cleaned = cleanRecords(records);
    
    expect(cleaned[0].payment_percentage_15_days).toBe(100);
    expect(cleaned[1].payment_percentage_15_days).toBe(75);
    expect(cleaned[2].payment_percentage_15_days).toBe(0);
  });

  test('should add calculated women participation', () => {
    const records = [
      {
        women_persondays: 5000,
        persondays_of_central_liability_so_far: 10000,
      },
    ];
    
    const cleaned = cleanRecords(records);
    
    expect(cleaned[0].women_participation_percent).toBe(50);
  });

  test('should handle non-array input gracefully', () => {
    const cleaned = cleanRecords(null);
    expect(cleaned).toEqual([]);
  });

  test('should handle empty array', () => {
    const cleaned = cleanRecords([]);
    expect(cleaned).toEqual([]);
  });
});

describe('isValidPercentage', () => {
  test('should return true for valid percentages', () => {
    expect(isValidPercentage(0)).toBe(true);
    expect(isValidPercentage(50)).toBe(true);
    expect(isValidPercentage(100)).toBe(true);
    expect(isValidPercentage(75.5)).toBe(true);
  });

  test('should return false for out-of-range percentages', () => {
    expect(isValidPercentage(-10)).toBe(false);
    expect(isValidPercentage(150)).toBe(false);
  });

  test('should return false for non-numeric values', () => {
    expect(isValidPercentage('invalid')).toBe(false);
    expect(isValidPercentage({})).toBe(false);
    expect(isValidPercentage([])).toBe(false);
  });

  test('should return true for null and undefined', () => {
    expect(isValidPercentage(null)).toBe(true);
    expect(isValidPercentage(undefined)).toBe(true);
  });
});
