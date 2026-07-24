// A brand-new account always starts from zero — no demo data.
export function buildEmptyState() {
  return {
    transactions: [],
    goals: [],
    fixedBills: [],
    cards: [],
    settings: {
      theme: 'system',
      pinEnabled: false,
      biometricEnabled: false,
      pin: null,
      userName: 'Você',
    },
  };
}
