export const INITIAL_TEAM = [
  {
    id: 'agent-1',
    name: 'Ramesh Verma',
    role: 'Senior Loan Officer',
    phone: '+91 98765 43210',
    email: 'ramesh.verma@finlend.in',
    assignedCustomersCount: 3,
    totalManagedCapital: 750000,
    monthlyTarget: 15000,
    monthlyAchieved: 14200,
    status: 'Active',
    avatarColor: '#10B981'
  },
  {
    id: 'agent-2',
    name: 'Priya Sharma',
    role: 'Field Recovery Agent',
    phone: '+91 98123 55443',
    email: 'priya.sharma@finlend.in',
    assignedCustomersCount: 2,
    totalManagedCapital: 300000,
    monthlyTarget: 10000,
    monthlyAchieved: 9800,
    status: 'Active',
    avatarColor: '#8B5CF6'
  },
  {
    id: 'agent-3',
    name: 'Vikram Singh',
    role: 'Collection Agent',
    phone: '+91 99887 11223',
    email: 'vikram.singh@finlend.in',
    assignedCustomersCount: 2,
    totalManagedCapital: 200000,
    monthlyTarget: 8000,
    monthlyAchieved: 6500,
    status: 'Active',
    avatarColor: '#06B6D4'
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-101',
    name: 'Rajesh Kumar',
    phone: '+91 98221 00112',
    city: 'Jaipur',
    aadhaar: 'XXXX-XXXX-4812',
    pan: 'ABCDE1234F',
    occupation: 'Textile Business Owner',
    assignedAgentId: 'agent-1',
    rating: 'A+ Excellent',
    creditScore: 780
  },
  {
    id: 'cust-102',
    name: 'Anita Patel',
    phone: '+91 97110 33445',
    city: 'Ahmedabad',
    aadhaar: 'XXXX-XXXX-9918',
    pan: 'FGHIJ5678K',
    occupation: 'Boutique Owner',
    assignedAgentId: 'agent-1',
    rating: 'A Good',
    creditScore: 720
  },
  {
    id: 'cust-103',
    name: 'Suresh Yadav',
    phone: '+91 96543 88776',
    city: 'Delhi NCR',
    aadhaar: 'XXXX-XXXX-3341',
    pan: 'KLMNO9012P',
    occupation: 'Transport Services',
    assignedAgentId: 'agent-2',
    rating: 'B Watchlist',
    creditScore: 650
  },
  {
    id: 'cust-104',
    name: 'Sunita Devi',
    phone: '+91 94120 77665',
    city: 'Indore',
    aadhaar: 'XXXX-XXXX-7789',
    pan: 'QRSTU3456V',
    occupation: 'Grocery Store Owner',
    assignedAgentId: 'agent-2',
    rating: 'A+ Excellent',
    creditScore: 795
  },
  {
    id: 'cust-105',
    name: 'Deepak Verma',
    phone: '+91 93210 11998',
    city: 'Lucknow',
    aadhaar: 'XXXX-XXXX-1122',
    pan: 'WXYZP7890Q',
    occupation: 'Electronics Contractor',
    assignedAgentId: 'agent-3',
    rating: 'B Standard',
    creditScore: 690
  }
];

export const INITIAL_LOANS = [
  {
    id: 'LN-2026-01',
    customerId: 'cust-101',
    customerName: 'Rajesh Kumar',
    agentId: 'agent-1',
    agentName: 'Ramesh Verma',
    principalAmount: 500000,
    byajType: 'Monthly % Byaj',
    monthlyRatePct: 2.0, // 2% per month = ₹10,000 / month
    dailyRateRupees: 0,
    startDate: '2026-01-10',
    nextDueDate: '2026-10-10',
    status: 'active', // active, overdue, pending_approval, closed
    collateralType: 'Gold Jewellery',
    collateralDetails: '100g 22K Gold Bangles & Chain (Appraised Value: ₹7,20,000)',
    totalByajCollected: 80000,
    totalPrincipalRepaid: 50000,
    notes: 'Punctual debtor. Pays on 10th of every month.'
  },
  {
    id: 'LN-2026-02',
    customerId: 'cust-102',
    customerName: 'Anita Patel',
    agentId: 'agent-1',
    agentName: 'Ramesh Verma',
    principalAmount: 250000,
    byajType: 'Monthly % Byaj',
    monthlyRatePct: 2.5, // 2.5% per month = ₹6,250 / month
    dailyRateRupees: 0,
    startDate: '2026-02-15',
    nextDueDate: '2026-09-15',
    status: 'overdue',
    collateralType: 'Post Dated Cheques',
    collateralDetails: 'HDFC Bank Cheque #401928 & Vehicle RC',
    totalByajCollected: 37500,
    totalPrincipalRepaid: 0,
    notes: 'Payment delayed by 12 days. Field agent Priya visiting customer.'
  },
  {
    id: 'LN-2026-03',
    customerId: 'cust-103',
    customerName: 'Suresh Yadav',
    agentId: 'agent-2',
    agentName: 'Priya Sharma',
    principalAmount: 100000,
    byajType: 'Daily Roj Byaj',
    monthlyRatePct: 0,
    dailyRateRupees: 200, // ₹200 / day
    startDate: '2026-03-01',
    nextDueDate: '2026-09-28',
    status: 'active',
    collateralType: 'Commercial Vehicle RC',
    collateralDetails: 'Mahindra Bolero Pickup Original RC & Key Duplicate',
    totalByajCollected: 42000,
    totalPrincipalRepaid: 20000,
    notes: 'Daily collection via UPI GPay by Priya Sharma.'
  },
  {
    id: 'LN-2026-04',
    customerId: 'cust-104',
    customerName: 'Sunita Devi',
    agentId: 'agent-2',
    agentName: 'Priya Sharma',
    principalAmount: 200000,
    byajType: 'Monthly % Byaj',
    monthlyRatePct: 1.8,
    dailyRateRupees: 0,
    startDate: '2026-04-05',
    nextDueDate: '2026-10-05',
    status: 'active',
    collateralType: 'Property Registry',
    collateralDetails: 'Commercial Shop Plot Agreement Original Docs',
    totalByajCollected: 18000,
    totalPrincipalRepaid: 0,
    notes: 'Reliable customer. Auto-debit scheduled.'
  },
  {
    id: 'LN-2026-05',
    customerId: 'cust-105',
    customerName: 'Deepak Verma',
    agentId: 'agent-3',
    agentName: 'Vikram Singh',
    principalAmount: 750000,
    byajType: 'Monthly % Byaj',
    monthlyRatePct: 2.0,
    dailyRateRupees: 0,
    startDate: '2026-09-20',
    nextDueDate: '2026-10-20',
    status: 'pending_approval',
    collateralType: 'Gold Jewellery',
    collateralDetails: '150g Gold Ornaments (Appraised: ₹10,50,000)',
    totalByajCollected: 0,
    totalPrincipalRepaid: 0,
    notes: 'Submitted by Agent Vikram Singh. Requires Owner Approval for disbursement.'
  }
];

export const INITIAL_COLLECTIONS = [
  {
    id: 'COL-901',
    loanId: 'LN-2026-01',
    customerName: 'Rajesh Kumar',
    agentName: 'Ramesh Verma',
    date: '2026-09-10',
    amountPaid: 10000,
    type: 'Byaj Only', // Byaj Only, Principal Repayment, Principal + Byaj, Late Penalty
    paymentMode: 'UPI / GPay',
    transactionRef: 'UPI/9821210943/AXIS',
    receiptNo: 'REC-2026-091'
  },
  {
    id: 'COL-902',
    loanId: 'LN-2026-03',
    customerName: 'Suresh Yadav',
    agentName: 'Priya Sharma',
    date: '2026-09-25',
    amountPaid: 1400,
    type: 'Daily Roj Byaj (7 Days)',
    paymentMode: 'Cash',
    transactionRef: 'CASH-REC-002',
    receiptNo: 'REC-2026-092'
  },
  {
    id: 'COL-903',
    loanId: 'LN-2026-04',
    customerName: 'Sunita Devi',
    agentName: 'Priya Sharma',
    date: '2026-09-05',
    amountPaid: 3600,
    type: 'Byaj Only',
    paymentMode: 'Bank NEFT',
    transactionRef: 'NEFT/HDFC/992104',
    receiptNo: 'REC-2026-093'
  }
];
