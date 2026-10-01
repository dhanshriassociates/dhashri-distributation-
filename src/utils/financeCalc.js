// Currency Formatter & Byaj Interest Calculations

export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Calculate Monthly Byaj (Simple Interest per Month)
export function calculateMonthlyByaj(principal, monthlyRatePct, months = 1) {
  const monthlyInterest = (principal * monthlyRatePct) / 100;
  const totalInterest = monthlyInterest * months;
  return {
    monthlyInterest,
    totalInterest,
    totalRepayment: principal + totalInterest
  };
}

// Calculate Daily Byaj (Roj Byaj e.g. ₹100 per day on ₹50,000)
export function calculateDailyByaj(principal, dailyRateRupees, days = 30) {
  const totalInterest = dailyRateRupees * days;
  return {
    dailyInterest: dailyRateRupees,
    totalInterest,
    totalRepayment: principal + totalInterest
  };
}

// Overdue status calculator
export function getLoanStatus(dueDateStr, currentStatus) {
  if (currentStatus === 'closed' || currentStatus === 'pending_approval') {
    return currentStatus;
  }
  if (!dueDateStr) return 'active';
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dueDate < today) {
    const diffTime = Math.abs(today - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { isOverdue: true, daysOverdue: diffDays };
  }
  return { isOverdue: false, daysOverdue: 0 };
}
