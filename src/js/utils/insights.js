import { formatCurrency } from './format.js';
import { getCategory } from '../data/categories.js';
import { monthSummary, percentChange, categoryBreakdown, monthTransactions } from '../store/selectors.js';

export function buildInsights(transactions, goals) {
  const insights = [];
  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const current = monthSummary(transactions, now);
  const previous = monthSummary(transactions, prevDate);

  if (previous.expense > 0) {
    const change = percentChange(current.expense, previous.expense);
    if (change <= -3) {
      insights.push({ icon: 'trending', text: `Você gastou ${Math.abs(change).toFixed(0)}% menos que no mês passado.` });
    } else if (change >= 3) {
      insights.push({ icon: 'trending', text: `Seus gastos subiram ${change.toFixed(0)}% em relação ao mês passado.` });
    }
  }

  const currentMonthTx = monthTransactions(transactions, now.getFullYear(), now.getMonth());
  const topCategory = categoryBreakdown(currentMonthTx, 'expense')[0];
  if (topCategory) {
    insights.push({ icon: 'tag', text: `Seu maior gasto este mês foi com ${getCategory(topCategory.category).label.toLowerCase()}.` });
  }

  if (current.savings > 0) {
    insights.push({ icon: 'wallet', text: `Você economizou ${formatCurrency(current.savings)} este mês.` });
  } else if (current.savings < 0) {
    insights.push({ icon: 'info', text: `Você gastou ${formatCurrency(Math.abs(current.savings))} a mais do que ganhou este mês.` });
  }

  if (goals && goals.length) {
    const goal = goals.find((g) => g.savedAmount < g.targetAmount);
    if (goal && current.savings > 0) {
      const remaining = goal.targetAmount - goal.savedAmount;
      const months = Math.max(1, Math.ceil(remaining / current.savings));
      insights.push({ icon: 'target', text: `Se continuar nesse ritmo, você atinge a meta "${goal.title}" em ${months} ${months === 1 ? 'mês' : 'meses'}.` });
    }
  }

  return insights.slice(0, 3);
}
