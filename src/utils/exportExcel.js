import * as XLSX from 'xlsx';

export function exportChatToExcel(messages, rating, feedback) {
  const chatData = messages
    .filter(m => m.type === 'user' || m.type === 'bot')
    .map((m, i) => ({
      '#': i + 1,
      'Role': m.type === 'user' ? 'User' : 'AVION',
      'Message': m.text,
      'Time': new Date(m.timestamp).toLocaleTimeString(),
    }));

  const summaryData = [
    { 'Field': 'Date', 'Value': new Date().toLocaleDateString() },
    { 'Field': 'Total Messages', 'Value': chatData.length },
    { 'Field': 'Rating', 'Value': `${rating}/5` },
    { 'Field': 'Feedback', 'Value': feedback || 'N/A' },
  ];

  const wb = XLSX.utils.book_new();

  const chatSheet = XLSX.utils.json_to_sheet(chatData);
  chatSheet['!cols'] = [
    { wch: 5 },
    { wch: 10 },
    { wch: 80 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, chatSheet, 'Chat Log');

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  XLSX.writeFile(wb, `AVION_Chat_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
