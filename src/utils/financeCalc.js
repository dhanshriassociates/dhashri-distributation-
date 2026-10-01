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

// Calculate Fix Total Return Repayment Scheme (e.g. ₹85,000 Disbursed -> ₹1,00,000 Fix Total Return)
export function calculateFixRepayment(principal, totalRepayment, frequency = 'daily', installmentAmount = 0, totalInstallments = 0) {
  const p = parseFloat(principal) || 0;
  const target = Math.max(p, parseFloat(totalRepayment) || p);
  const totalProfit = Math.max(0, target - p);
  const profitPercentage = p > 0 ? ((totalProfit / p) * 100).toFixed(2) : 0;

  let emi = 0;
  let count = 1;

  if (installmentAmount && parseFloat(installmentAmount) > 0) {
    emi = parseFloat(installmentAmount);
    count = Math.max(1, Math.ceil(target / emi));
  } else if (totalInstallments && parseInt(totalInstallments) > 0) {
    count = parseInt(totalInstallments);
    emi = Math.round(target / count);
  } else {
    count = frequency === 'daily' ? 100 : frequency === 'weekly' ? 20 : 12;
    emi = Math.round(target / count);
  }

  return {
    principal: p,
    totalRepayment: target,
    totalProfit,
    profitPercentage,
    frequency,
    installmentAmount: emi,
    totalInstallments: count
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

