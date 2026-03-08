export const calculateSeasonalPosition = (date: string | null): number => {
  if (!date) return 0;
  
  const month = new Date(date).getMonth();
  
  // Map months to positions (0-100)
  const seasonalMap = {
    0: 20,  // January (Low)
    1: 25,  // February (Low)
    2: 30,  // March (Low)
    3: 45,  // April (Medium)
    4: 60,  // May (Medium)
    5: 75,  // June (High)
    6: 90,  // July (Peak)
    7: 85,  // August (High)
    8: 70,  // September (Medium)
    9: 50,  // October (Medium)
    10: 35, // November (Low)
    11: 25  // December (Low)
  };
  
  return seasonalMap[month] || 0;
};

export const getSeasonalPriceText = (date: string | null): string => {
  if (!date) return 'Select dates to see trends';
  
  const month = new Date(date).getMonth();
  
  const seasonalText = {
    0: 'Low Season - Best Rates',
    1: 'Low Season - Best Rates',
    2: 'Low Season - Good Rates',
    3: 'Shoulder Season - Average Rates',
    4: 'Shoulder Season - Average Rates',
    5: 'High Season - Peak Rates',
    6: 'Peak Season - Highest Rates',
    7: 'High Season - Peak Rates',
    8: 'Shoulder Season - Average Rates',
    9: 'Shoulder Season - Average Rates',
    10: 'Low Season - Good Rates',
    11: 'Low Season - Best Rates'
  };
  
  return seasonalText[month] || 'Select dates to see trends';
};