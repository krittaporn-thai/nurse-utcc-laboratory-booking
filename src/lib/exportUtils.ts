/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Booking, Laboratory, PreInspection, PostInspection, DamageLog } from '../types';

/**
 * Trigger CSV download with UTF-8 BOM so Thai text renders properly in Excel
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))].join(
      '\n'
    );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger genuine .xlsx Excel workbook download
 */
export function downloadXLSX(filename: string, sheets: { name: string; data: Record<string, any>[] }[]) {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31));
  });

  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Export JSON Backup File
 */
export function downloadJSONBackup(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate formatted PDF Print view
 */
export function openPrintWindow(
  title: string,
  subtitle: string,
  summaryCards: { label: string; value: string }[],
  sections: { title: string; headers: string[]; rows: (string | number)[][] }[]
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const cardsHtml = summaryCards
    .map(
      (c) => `
    <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; background-color: #f8fafc;">
      <div style="font-size: 11px; color: #64748b; font-weight: 600;">${c.label}</div>
      <div style="font-size: 20px; font-weight: 800; color: #0f766e; margin-top: 4px;">${c.value}</div>
    </div>
  `
    )
    .join('');

  const sectionsHtml = sections
    .map(
      (s) => `
    <div style="margin-top: 24px;">
      <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #0d9488; padding-bottom: 4px; margin-bottom: 12px;">
        ${s.title}
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #1e293b;">
            ${s.headers.map((h) => `<th style="border: 1px solid #cbd5e1; padding: 8px;">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${s.rows
            .map(
              (r) => `
            <tr>
              ${r.map((cell) => `<td style="border: 1px solid #e2e8f0; padding: 6px 8px;">${cell}</td>`).join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
        body { font-family: 'Sarabun', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 24px; color: #0f172a; line-height: 1.4; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f766e; padding-bottom: 12px; }
        .title { font-size: 18px; font-weight: 800; color: #0f766e; }
        .subtitle { font-size: 12px; color: #475569; margin-top: 2px; }
        .grid { display: grid; grid-template-columns: repeat(${summaryCards.length || 1}, 1fr); gap: 12px; margin-top: 16px; }
        .footer { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">${title}</div>
          <div class="subtitle">${subtitle} | คณะพยาบาลศาสตร์ มหาวิทยาลัยหอการค้าไทย</div>
        </div>
        <div style="text-align: right; font-size: 10px; color: #64748b;">
          <div>พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}</div>
          <div>ผู้ออกรายงาน: กฤตพร ดวงใจ (ผู้ดูแลระบบ)</div>
        </div>
      </div>

      <div class="grid">${cardsHtml}</div>

      ${sectionsHtml}

      <div class="footer">
        รายงานนี้สร้างขึ้นอย่างเป็นทางการโดยระบบ NurseLab UTCC | ระบบจัดเก็บข้อมูลสถิติห้องปฏิบัติการพยาบาล
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
