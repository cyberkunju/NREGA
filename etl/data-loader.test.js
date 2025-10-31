const { Pool } = require('pg');
const { ensureDistricts } = require('./data-loader');

// Mock the Pool and Client
jest.mock('pg', () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  return {
    Pool: jest.fn(() => ({
      connect: jest.fn().mockResolvedValue(mockClient),
      query: jest.fn(),
    })),
  };
});

describe('ensureDistricts', () => {
  let pool;
  let mockClient;

  beforeEach(() => {
    pool = new Pool();
    mockClient = {
      query: jest.fn().mockResolvedValue({ rowCount: 1 }),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
    // Reset mocks before each test
    mockClient.query.mockClear();
    pool.connect.mockClear();
  });

  it('should not fail with empty records', async () => {
    await ensureDistricts(pool, []);
    expect(mockClient.query).not.toHaveBeenCalled();
  });

  it('should insert unique districts from records', async () => {
    const records = [
      { district_name: 'District A', state: 'State X' },
      { district_name: 'District B', state: 'State Y' },
    ];

    await ensureDistricts(pool, records);

    // BEGIN, INSERT, INSERT, COMMIT
    expect(mockClient.query).toHaveBeenCalledTimes(4);
    // Check that the correct INSERT statements were called
    expect(mockClient.query.mock.calls[1][0]).toContain('INSERT INTO districts');
    expect(mockClient.query.mock.calls[1][1]).toEqual(['District A', 'State X']);
    expect(mockClient.query.mock.calls[2][0]).toContain('INSERT INTO districts');
    expect(mockClient.query.mock.calls[2][1]).toEqual(['District B', 'State Y']);
  });

  it('should handle districts with the same name in different states', async () => {
    const records = [
      { district_name: 'Springfield', state: 'State A' },
      { district_name: 'Springfield', state: 'State B' },
      { district_name: 'Fairview', state: 'State A' },
    ];

    await ensureDistricts(pool, records);

    // BEGIN, 3x INSERT, COMMIT
    expect(mockClient.query).toHaveBeenCalledTimes(5);
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('($1, $2)'), ['Springfield', 'State A']);
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('($1, $2)'), ['Springfield', 'State B']);
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('($1, $2)'), ['Fairview', 'State A']);
  });

  it('should handle records where state is missing', async () => {
    const records = [{ district_name: 'NoStateLand' }];

    await ensureDistricts(pool, records);

    expect(mockClient.query).toHaveBeenCalledTimes(3); // BEGIN, INSERT, COMMIT
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('($1, $2)'), ['NoStateLand', 'Unknown']);
  });

  it('should correctly deduplicate records', async () => {
    const records = [
      { district_name: 'Duplicate', state: 'State Z' },
      { district_name: 'Duplicate', state: 'State Z' },
    ];

    await ensureDistricts(pool, records);

    // BEGIN, one INSERT, COMMIT
    expect(mockClient.query).toHaveBeenCalledTimes(3);
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('($1, $2)'), ['Duplicate', 'State Z']);
  });
});
