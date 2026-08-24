import { expect, test, describe } from 'vitest';
import { calculateTotalPortions } from '../src/lib/domain/portions';

describe('calculateTotalPortions', () => {
  const users = [
    { id: 1, defaultPortion: 1 },
    { id: 2, defaultPortion: 1 },
    { id: 3, defaultPortion: 0.5 },
    { id: 4, defaultPortion: 1.5 },
  ];

  test('everyone eating default portions', () => {
    const attendances = [
      { userId: 1, status: "EATING" },
      { userId: 2, status: "EATING" },
      { userId: 3, status: "EATING" },
      { userId: 4, status: "EATING" },
    ];
    
    const total = calculateTotalPortions(attendances, users);
    expect(total).toBe(1 + 1 + 0.5 + 1.5); // 4
  });

  test('one person not eating', () => {
    const attendances = [
      { userId: 1, status: "EATING" },
      { userId: 2, status: "EATING" },
      { userId: 3, status: "NOT_EATING" },
      { userId: 4, status: "EATING" },
    ];
    
    const total = calculateTotalPortions(attendances, users);
    expect(total).toBe(1 + 1 + 1.5); // 3.5
  });

  test('everyone not eating', () => {
    const attendances = [
      { userId: 1, status: "NOT_EATING" },
      { userId: 2, status: "NOT_EATING" },
      { userId: 3, status: "MAYBE" },
      { userId: 4, status: "NOT_EATING" },
    ];
    
    const total = calculateTotalPortions(attendances, users);
    expect(total).toBe(0); // MAYBE counts as 0
  });

  test('using portion override', () => {
    const attendances = [
      { userId: 1, status: "EATING", portionOverride: 2 },
      { userId: 2, status: "EATING" },
    ];
    
    const total = calculateTotalPortions(attendances, users);
    expect(total).toBe(2 + 1); // 3
  });
  
  test('MAYBE status resolves to 0', () => {
    const attendances = [
      { userId: 1, status: "MAYBE" },
    ];
    
    const total = calculateTotalPortions(attendances, users);
    expect(total).toBe(0); 
  });
});
