import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportDashboardToExcel = async (data, chartsBase64) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Report', {
    views: [{ showGridLines: false }],
  });

  const year = new Date().getFullYear();

  // Basic Setup
  sheet.getColumn('A').width = 4;
  sheet.getColumn('B').width = 15;
  sheet.getColumn('C').width = 10;
  sheet.getColumn('D').width = 10;
  sheet.getColumn('E').width = 12;

  sheet.getColumn('F').width = 2; // spacer
  
  sheet.getColumn('G').width = 4;
  sheet.getColumn('H').width = 12;
  sheet.getColumn('I').width = 10;
  sheet.getColumn('J').width = 10;
  sheet.getColumn('K').width = 10;
  sheet.getColumn('L').width = 10;
  sheet.getColumn('M').width = 10;

  sheet.getColumn('N').width = 2; // spacer

  sheet.getColumn('O').width = 4;
  sheet.getColumn('P').width = 25;
  sheet.getColumn('Q').width = 8;
  sheet.getColumn('R').width = 10;
  sheet.getColumn('S').width = 10;

  // Set default font for all columns
  sheet.columns.forEach(column => {
    column.font = { name: 'Khmer OS Battambang', size: 11 };
  });

  // Title
  sheet.mergeCells('A1:S2');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `Monthly Students' Reading in Library Report - ${year}`;
  titleCell.font = { name: 'Khmer OS Battambang', size: 16, bold: true, color: { argb: 'FF1F497D' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Helper function to create headers
  const createHeader = (cellRef, text, mergeToRef = null) => {
    if (mergeToRef) {
      sheet.mergeCells(`${cellRef}:${mergeToRef}`);
    }
    const cell = sheet.getCell(cellRef);
    cell.value = text;
    cell.font = { name: 'Khmer OS Battambang', bold: true, color: { argb: 'FF1F497D' } };
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  };

  // Helper function to create a table header
  const createTableHeaderRow = (startRow, startCol, headers) => {
    headers.forEach((header, index) => {
      const colLetter = String.fromCharCode(startCol.charCodeAt(0) + index);
      const cell = sheet.getCell(`${colLetter}${startRow}`);
      cell.value = header;
      cell.font = { name: 'Khmer OS Battambang', bold: true, color: { argb: 'FF1F497D' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  };

  // 1) Monthly Students' Reading Qty in Library Report
  createHeader('A4', "1) Monthly Students' Reading Qty in Library Report", 'E4');
  createTableHeaderRow(5, 'A', ['No', 'Month Report', 'Qty', 'Ratio (%)', 'Average/Day']);
  
  let currentRow = 6;
  const monthData = data.monthlyData || [];
  monthData.forEach((row, i) => {
    const rowValues = [i + 1, row.month, row.qty, row.ratio, row.average];
    rowValues.forEach((val, j) => {
      const colLetter = String.fromCharCode('A'.charCodeAt(0) + j);
      const cell = sheet.getCell(`${colLetter}${currentRow}`);
      cell.value = val;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (j === 1) cell.alignment.horizontal = 'left';
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    currentRow++;
  });

  // Totals row
  const totalQty = monthData.reduce((acc, curr) => acc + curr.qty, 0);
  sheet.mergeCells(`A${currentRow}:B${currentRow}`);
  const totalLabelCell = sheet.getCell(`A${currentRow}`);
  totalLabelCell.value = 'Total:';
  totalLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };
  totalLabelCell.font = { name: 'Khmer OS Battambang', bold: true };
  totalLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  totalLabelCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

  const totalValueCell = sheet.getCell(`C${currentRow}`);
  totalValueCell.value = totalQty;
  totalValueCell.alignment = { horizontal: 'center', vertical: 'middle' };
  totalValueCell.font = { name: 'Khmer OS Battambang', bold: true };
  totalValueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  totalValueCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  
  ['D', 'E'].forEach(col => {
      const c = sheet.getCell(`${col}${currentRow}`);
      c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  });

  // 3) Monthly Reading Qty By Gender Report
  const genderStartRow = currentRow + 3;
  createHeader(`A${genderStartRow}`, "3) Monthly Reading Qty By Gender Report", `E${genderStartRow}`);
  createTableHeaderRow(genderStartRow + 1, 'A', ['No', 'By Gender', 'Qty', 'Ratio (%)', 'Remark']);
  
  let genderRow = genderStartRow + 2;
  const genderData = data.genderData || [];
  genderData.forEach((row, i) => {
    const rowValues = [i + 1, row.gender, row.qty, row.ratio, row.remark || ''];
    rowValues.forEach((val, j) => {
      const colLetter = String.fromCharCode('A'.charCodeAt(0) + j);
      const cell = sheet.getCell(`${colLetter}${genderRow}`);
      cell.value = val;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (j === 1) cell.alignment.horizontal = 'left';
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    genderRow++;
  });
  
  // Totals row for gender
  const totalGenderQty = genderData.reduce((acc, curr) => acc + curr.qty, 0);
  sheet.mergeCells(`A${genderRow}:B${genderRow}`);
  const tgLabelCell = sheet.getCell(`A${genderRow}`);
  tgLabelCell.value = 'Total:';
  tgLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };
  tgLabelCell.font = { name: 'Khmer OS Battambang', bold: true };
  tgLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  tgLabelCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

  const tgValueCell = sheet.getCell(`C${genderRow}`);
  tgValueCell.value = totalGenderQty;
  tgValueCell.alignment = { horizontal: 'center', vertical: 'middle' };
  tgValueCell.font = { name: 'Khmer OS Battambang', bold: true };
  tgValueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  tgValueCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  
  ['D', 'E'].forEach(col => {
      const c = sheet.getCell(`${col}${genderRow}`);
      c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  });

  // 2) Top 10 Books' Title Reading Report
  createHeader('O4', "2) Top 10 Books' Title Reading Report", 'S4');
  createTableHeaderRow(5, 'O', ['No', 'Book Name', 'Qty', 'Ratio (%)', '']);
  
  let bookRow = 6;
  const bookData = data.bookData || [];
  bookData.forEach((row, i) => {
    const rowValues = [i + 1, row.name, row.qty, row.ratio, ''];
    rowValues.forEach((val, j) => {
      const colLetter = String.fromCharCode('O'.charCodeAt(0) + j);
      const cell = sheet.getCell(`${colLetter}${bookRow}`);
      cell.value = val;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (j === 1) cell.alignment.horizontal = 'left';
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    bookRow++;
  });
  
  // Total books
  const totalBookQty = bookData.reduce((acc, curr) => acc + curr.qty, 0);
  sheet.mergeCells(`O${bookRow}:P${bookRow}`);
  const tbLabelCell = sheet.getCell(`O${bookRow}`);
  tbLabelCell.value = 'Total:';
  tbLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };
  tbLabelCell.font = { name: 'Khmer OS Battambang', bold: true };
  tbLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  tbLabelCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

  const tbValueCell = sheet.getCell(`Q${bookRow}`);
  tbValueCell.value = totalBookQty;
  tbValueCell.alignment = { horizontal: 'center', vertical: 'middle' };
  tbValueCell.font = { name: 'Khmer OS Battambang', bold: true };
  tbValueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  tbValueCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  
  ['R', 'S'].forEach(col => {
      const c = sheet.getCell(`${col}${bookRow}`);
      c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  });

  // Adding Charts as Images
  if (chartsBase64) {
    if (chartsBase64.lineChart) {
      const imageId = workbook.addImage({
        base64: chartsBase64.lineChart,
        extension: 'png',
      });
      // Place it in G5 to M18
      sheet.addImage(imageId, {
        tl: { col: 6, row: 4 }, // col G (0-indexed is 6), row 5
        br: { col: 13, row: 17 } // col M, row 18
      });
    }

    if (chartsBase64.pieChart) {
      const imageId = workbook.addImage({
        base64: chartsBase64.pieChart,
        extension: 'png',
      });
      
      // Ensure pie chart starts below the line chart (which ends at row 17)
      const pieRowStart = Math.max(19, genderStartRow - 1);
      
      // Place it in G to M
      sheet.addImage(imageId, {
        tl: { col: 6, row: pieRowStart },
        br: { col: 13, row: pieRowStart + 12 }
      });
    }

    if (chartsBase64.barChart) {
      const imageId = workbook.addImage({
        base64: chartsBase64.barChart,
        extension: 'png',
      });
      // Place it in O17 to S30
      sheet.addImage(imageId, {
        tl: { col: 14, row: bookRow + 1 },
        br: { col: 19, row: bookRow + 15 }
      });
    }
  }

  // Generate and save file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Monthly_Students_Reading_Report_${year}.xlsx`);
};
