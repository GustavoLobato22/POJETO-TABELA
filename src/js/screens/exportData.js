import { icon } from '../icons.js';
import { openPage } from '../ui/page.js';
import { showToast } from '../ui/toast.js';
import { store } from '../store/store.js';
import { exportTransactionsCsv, exportBackupJson } from '../utils/csv.js';
import { printMonthlyReport } from '../utils/pdfReport.js';

export function openExportPage() {
  openPage({
    title: 'Backup & Exportação',
    render(body) {
      body.innerHTML = `
        <div class="card" style="display:flex;flex-direction:column;gap:2px;margin-bottom:20px">
          <button class="menu-row" id="export-csv" style="width:100%;text-align:left">
            <span class="menu-row__icon">${icon('download', { size: 17 })}</span>
            <span class="menu-row__label">Exportar CSV <span class="text-caption text-tertiary">(abre no Excel/Sheets)</span></span>
            ${icon('chevronRight', { size: 16, className: 'menu-row__chevron' })}
          </button>
          <div class="list-divider"></div>
          <button class="menu-row" id="export-pdf" style="width:100%;text-align:left">
            <span class="menu-row__icon">${icon('download', { size: 17 })}</span>
            <span class="menu-row__label">Exportar PDF <span class="text-caption text-tertiary">(relatório do mês)</span></span>
            ${icon('chevronRight', { size: 16, className: 'menu-row__chevron' })}
          </button>
          <div class="list-divider"></div>
          <button class="menu-row" id="export-backup" style="width:100%;text-align:left">
            <span class="menu-row__icon">${icon('wallet', { size: 17 })}</span>
            <span class="menu-row__label">Backup completo (JSON)</span>
            ${icon('chevronRight', { size: 16, className: 'menu-row__chevron' })}
          </button>
        </div>

        <div class="card">
          <label class="menu-row" style="cursor:pointer">
            <span class="menu-row__icon">${icon('upload', { size: 17 })}</span>
            <span class="menu-row__label">Restaurar backup</span>
            <input type="file" id="restore-input" accept="application/json" style="display:none" />
          </label>
        </div>
        <p class="text-footnote text-tertiary" style="margin-top:14px;line-height:1.6">
          Seus dados ficam salvos localmente neste dispositivo. Use o backup para movê-los para outro aparelho.
        </p>
      `;

      body.querySelector('#export-csv').addEventListener('click', () => {
        exportTransactionsCsv(store.state.transactions);
        showToast('CSV exportado');
      });
      body.querySelector('#export-pdf').addEventListener('click', () => {
        printMonthlyReport(store.state);
      });
      body.querySelector('#export-backup').addEventListener('click', () => {
        exportBackupJson(store.state);
        showToast('Backup exportado');
      });
      body.querySelector('#restore-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            if (!data.transactions) throw new Error('invalid');
            store.state = data;
            store.notify();
            showToast('Backup restaurado');
          } catch (err) {
            showToast('Arquivo de backup inválido', { iconName: 'close' });
          }
        };
        reader.readAsText(file);
      });
    },
  });
}
