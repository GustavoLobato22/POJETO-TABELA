export const PAYMENT_METHODS = [
  { id: 'dinheiro', label: 'Dinheiro', icon: 'wallet' },
  { id: 'pix', label: 'Pix', icon: 'pix' },
  { id: 'debito', label: 'Débito', icon: 'card' },
  { id: 'credito', label: 'Crédito', icon: 'card' },
  { id: 'conta', label: 'Conta Bancária', icon: 'bank' },
];

export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find((p) => p.id === id) || PAYMENT_METHODS[0];
}
