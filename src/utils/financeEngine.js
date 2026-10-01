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

// Safe Day Addition
export function addDays(dateInput, days) {
  const d = new Date(dateInput);
  d.setDate(d.getDate() + days);
  return d;
}

// Safe Month Addition (prevents 31st Jan -> 3rd March overflow)
export function addMonths(dateInput, months) {
  const d = new Date(dateInput);
  const originalDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const maxDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(originalDay, maxDays));
  return d;
}

// Fixed Total Repayment Scheme Schedule Generator (e.g. ₹85,000 Disbursed -> ₹1,00,000 Total Return)
export function generateFixRepaymentSchedule({
  principal,
  totalRepayment,
  frequency = 'daily', // 'daily', 'weekly', 'monthly'
  installmentAmount,
  totalInstallments,
  startDateStr = new Date().toISOString().split('T')[0]
}) {
  const p = parseFloat(principal) || 0;
  const targetTotal = Math.max(p, parseFloat(totalRepayment) || p);
  const totalInterest = Math.max(0, targetTotal - p);
  const startDate = new Date(startDateStr);

  let numInstallments = 1;
  let singleEmi = 0;

  if (installmentAmount && parseFloat(installmentAmount) > 0) {
    singleEmi = parseFloat(installmentAmount);
    numInstallments = Math.max(1, Math.ceil(targetTotal / singleEmi));
  } else if (totalInstallments && parseInt(totalInstallments) > 0) {
    numInstallments = parseInt(totalInstallments);
    singleEmi = Math.round(targetTotal / numInstallments);
  } else {
    numInstallments = frequency === 'daily' ? 100 : frequency === 'weekly' ? 20 : 12;
    singleEmi = Math.round(targetTotal / numInstallments);
  }

  const schedule = [];
  let remainingTotalBalance = targetTotal;
  let remainingPrincipalBalance = p;

  const principalRatio = targetTotal > 0 ? (p / targetTotal) : 1;

  for (let i = 1; i <= numInstallments; i++) {
    let dueDate;
    if (frequency === 'daily') {
      dueDate = addDays(startDate, i);
    } else if (frequency === 'weekly') {
      dueDate = addDays(startDate, i * 7);
    } else {
      dueDate = addMonths(startDate, i);
    }

    const isLast = i === numInstallments;
    // For last installment, allocate exact remainder so sum equals total exactly
    const emi = isLast ? remainingTotalBalance : Math.min(singleEmi, remainingTotalBalance);
    const principalPart = isLast ? remainingPrincipalBalance : Math.min(remainingPrincipalBalance, Math.round(emi * principalRatio));
    const interestPart = Math.max(0, emi - principalPart);

    remainingTotalBalance = Math.max(0, remainingTotalBalance - emi);
    remainingPrincipalBalance = Math.max(0, remainingPrincipalBalance - principalPart);

    schedule.push({
      installmentNo: i,
      dueDate: dueDate.toISOString().split('T')[0],
      emiAmount: Math.round(emi),
      principalComponent: Math.round(principalPart),
      interestComponent: Math.round(interestPart),
      remainingBalance: Math.round(remainingTotalBalance),
      status: i === 1 ? 'due' : 'upcoming' // due, paid, overdue, upcoming
    });
  }

  return schedule;
}

// EMI Schedule Generator using Reducing Balance, Simple Interest, or Fixed Total
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
      const dueDate = addMonths(startDate, i);

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
      const dueDate = addMonths(startDate, i);
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
