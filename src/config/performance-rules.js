

// Cache for the rules
let rulesCache = null;
let rulesPromise = null;

// Default rules as fallback
const defaultRules = {
  mbg: {
    daily_earning_threshold: 3500,
    hours_online_threshold: 12,
    confirmation_rate_threshold: 95,
    full_mbg_amount: 600,
    hourly_rate: 40,
    max_hours: 12
  },
  revenue_incentive: {
    slabs: [
      { max: 14999, type: "percentage", value: 10 },
      { min: 15000, max: 17999, type: "fixed", value: 2100 },
      { min: 18000, max: 20999, type: "fixed", value: 2700 },
      { min: 21000, max: 24999, type: "fixed", value: 3570 },
      { min: 25000, max: 27999, type: "fixed", value: 4500 },
      { min: 28000, max: 30999, type: "fixed", value: 5320 },
      { min: 31000, max: 33999, type: "fixed", value: 6200 },
      { min: 34000, max: 37999, type: "fixed", value: 6800 },
      { min: 38000, max: 40999, type: "fixed", value: 7980 },
      { min: 41000, type: "fixed", value: 8400 }
    ]
  },
  additional_incentive: {
    slabs: [
      { min: 90, max: 93, value: 200 },
      { min: 94, max: 95, value: 500 },
      { min: 95.01, value: 700 }
    ]
  },
  columns: {
    U: { static: 0 },
    Y: { static: 0 },
    Z: { static: 0 }
  },
  display: {
    currency: {
      locale: "en-IN",
      minimum_fraction_digits: 0,
      maximum_fraction_digits: 0
    },
    percentage: {
      multiplier: 100,
      suffix: "%"
    }
  }
};

// Initialize with default rules
let PERFORMANCE_RULES = { ...defaultRules };

// Load performance rules from JSON file
export const loadPerformanceRules = async () => {
  // Return cached rules if available
  if (rulesCache) {
    return rulesCache;
  }
  
  // If already loading, return the existing promise
  if (rulesPromise) {
    return rulesPromise;
  }
  
  // Load the rules
  rulesPromise = fetch('/performance-rules.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load performance rules');
      }
      return response.json();
    })
    .then(rules => {
      rulesCache = rules;
      PERFORMANCE_RULES = rules;
      return rules;
    })
    .catch(error => {
      console.error('Failed to load performance rules, using defaults:', error);
      return defaultRules;
    });
  
  return rulesPromise;
};

// Load rules immediately
loadPerformanceRules();

// Export functions that use the rules
export const getMBGConfig = () => PERFORMANCE_RULES.mbg;
export const getRevenueIncentiveSlabs = () => PERFORMANCE_RULES.revenue_incentive.slabs;
export const getAdditionalIncentiveSlabs = () => PERFORMANCE_RULES.additional_incentive.slabs;
export const getColumnsConfig = () => PERFORMANCE_RULES.columns;
export const getDisplayConfig = () => PERFORMANCE_RULES.display;

// MBG calculation
export const calculateDailyMBG = (dayData) => {
  const earning = parseFloat(dayData.total_earings || 0);
  const hours = parseFloat(dayData.hours_online || 0);
  const confRate = parseFloat(dayData.confirmation_rate || 0);
  const mbgConfig = PERFORMANCE_RULES.mbg;

  if (earning >= mbgConfig.daily_earning_threshold && 
      hours >= mbgConfig.hours_online_threshold && 
      confRate >= mbgConfig.confirmation_rate_threshold) {
    return mbgConfig.full_mbg_amount;
  }
  return Math.min(hours, mbgConfig.max_hours) * mbgConfig.hourly_rate;
};

// Revenue Incentive calculation
export const calculateRevenueIncentive = (totalEarning) => {
  const slabs = PERFORMANCE_RULES.revenue_incentive.slabs;
  
  for (const slab of slabs) {
    if (slab.min !== undefined && totalEarning < slab.min) continue;
    if (slab.max !== undefined && totalEarning > slab.max) continue;
    
    if (slab.type === 'percentage') {
      return totalEarning * (slab.value / 100);
    } else {
      return slab.value;
    }
  }
  return 0;
};

// Additional Incentive calculation
export const calculateAdditionalIncentive = (acceptancePct) => {
  const slabs = PERFORMANCE_RULES.additional_incentive.slabs;
  
  for (const slab of slabs) {
    if (acceptancePct >= slab.min) {
      if (!slab.max || acceptancePct <= slab.max) {
        return slab.value;
      }
    }
  }
  return 0;
};

// Format currency
export const formatCurrency = (value, decimals = 0) => {
  const num = Number(value);
    if (!num) return "-"; 
  
  const roundedNum = Math.round(num);
  return roundedNum.toLocaleString(PERFORMANCE_RULES.display.currency.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Format percentage
export const formatPercentage = (value) => {
  const num = Number(value);
    if (!num) return "-"; 
  const multiplied = num * PERFORMANCE_RULES.display.percentage.multiplier;
  return `${Math.round(multiplied)}${PERFORMANCE_RULES.display.percentage.suffix}`;
};

// Static values
export const getTotalDeposit = () => PERFORMANCE_RULES.columns.U.static;
export const getCredit = () => PERFORMANCE_RULES.columns.Y.static;
export const getDebit = () => PERFORMANCE_RULES.columns.Z.static;

