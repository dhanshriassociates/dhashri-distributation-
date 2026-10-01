// Finance Engine & EMI Schedule Calculations

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Mask sensitive numbers
export function maskAadhaar(aadhaar) {
  if (!aadhaar) return 'XXXX-XXXX-XXXX';
  const clean = aadhaar.replace(/\D/g, '');
  if (clean.length < 4) return aadhaar;
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

export function maskBankAccount(acc) {
  if (!acc) return 'XXXX-XXXX';
  const str = String(acc);
  if (str.length <= 4) return str;
  return `XXXX${str.slice(-4)}`;
}

// EMI Schedule Generator using Reducing Balance or Simple Interest
export function generateEmiSchedule(principal, annualRatePct, tenureMonths, startDateStr = new Date().toISOString().split('T')[0], calcMode = 'reducing') {
  const schedule = [];
  let balance = parseFloat(principal);
  const startDate = new Date(startDateStr);

  if (calcMode === 'reducing') {
    const monthlyRate = annualRatePct / (12 * 100);
    let emi = 0;
    if (monthlyRate > 0) {
      emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    } else {
      emi = principal / tenureMonths;
    }

    for (let i = 1; i <= tenureMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);

      const interestForMonth = balance * monthlyRate;
      const principalForMonth = emi - interestForMonth;
      balance = Math.max(0, balance - principalForMonth);

      schedule.push({
        installmentNo: i,
        dueDate: dueDate.toISOString().split('T')[0],
        emiAmount: Math.round(emi),
        principalComponent: Math.round(principalForMonth),
        interestComponent: Math.round(interestForMonth),
        remainingBalance: Math.round(balance),
        status: i === 1 ? 'due' : 'upcoming' // due, paid, overdue, upcoming
      });
    }
  } else {
    // Simple Interest / Flat Rate
    const totalInterest = (principal * annualRatePct * (tenureMonths / 12)) / 100;
    const totalRepayment = principal + totalInterest;
    const monthlyEmi = totalRepayment / tenureMonths;
    const monthlyInterest = totalInterest / tenureMonths;
    const monthlyPrincipal = principal / tenureMonths;

    for (let i = 1; i <= tenureMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);
      balance = Math.max(0, balance - monthlyPrincipal);

      schedule.push({
        installmentNo: i,
        dueDate: dueDate.toISOString().split('T')[0],
        emiAmount: Math.round(monthlyEmi),
        principalComponent: Math.round(monthlyPrincipal),
        interestComponent: Math.round(monthlyInterest),
        remainingBalance: Math.round(balance),
        status: i === 1 ? 'due' : 'upcoming'
      });
    }
  }

  return schedule;
}

// Calculate Overdue Aging Bucket
export function getOverdueBucket(dueDateStr) {
  if (!dueDateStr) return 'Current';
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dueDate >= today) return 'Current';

  const diffTime = Math.abs(today - dueDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) return '0-30 Days';
  if (diffDays <= 60) return '31-60 Days';
  if (diffDays <= 90) return '61-90 Days';
  return '90+ Days (NPA)';
}
