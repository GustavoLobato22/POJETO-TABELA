// Category catalogue — shared across income & expense (kind narrows what's shown).
export const CATEGORIES = [
  { id: 'alimentacao', label: 'Alimentação', icon: 'food', color: '#E8834A', kind: 'expense' },
  { id: 'mercado', label: 'Mercado', icon: 'cart', color: '#4AA6E8', kind: 'expense' },
  { id: 'combustivel', label: 'Combustível', icon: 'fuel', color: '#B08AE0', kind: 'expense' },
  { id: 'transporte', label: 'Transporte', icon: 'bus', color: '#5CB8A6', kind: 'expense' },
  { id: 'lazer', label: 'Lazer', icon: 'film', color: '#E0567A', kind: 'expense' },
  { id: 'saude', label: 'Saúde', icon: 'heart', color: '#E85D5D', kind: 'expense' },
  { id: 'moradia', label: 'Moradia', icon: 'house', color: '#C9A24B', kind: 'expense' },
  { id: 'investimentos', label: 'Investimentos', icon: 'trending', color: '#16A34A', kind: 'both' },
  { id: 'salario', label: 'Salário', icon: 'briefcase', color: '#16A34A', kind: 'income' },
  { id: 'freelance', label: 'Freelance', icon: 'briefcase', color: '#3B6FCC', kind: 'income' },
  { id: 'pix', label: 'Pix', icon: 'pix', color: '#4AA6E8', kind: 'both' },
  { id: 'outros', label: 'Outros', icon: 'tag', color: '#8B92A3', kind: 'both' },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function categoriesFor(kind) {
  return CATEGORIES.filter((c) => c.kind === kind || c.kind === 'both');
}
