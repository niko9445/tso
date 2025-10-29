import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

class ExcelExportService {
  static async exportToExcel(data, fileName = 'ТСО_экспорт') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('ТСО');

    // 1. Заголовок документа (центрированный и жирный)
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Технические средства охраны';
    titleCell.font = { 
      bold: true, 
      size: 16, 
      color: { argb: 'FF2C3E50' } // Темно-синий
    };
    titleCell.alignment = { 
      horizontal: 'center',
      vertical: 'middle'
    };

    // 2. Дата экспорта (центрированная)
    worksheet.mergeCells('A2:I2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Дата экспорта: ${new Date().toLocaleDateString('ru-RU')}`;
    dateCell.font = { 
      size: 12, 
      color: { argb: 'FF2C3E50' } 
    };
    dateCell.alignment = { 
      horizontal: 'center',
      vertical: 'middle'
    };

    // 3. Заголовки столбцов (центрированные + цвет)
    const headers = ["№", "Категория", "Наименование", "Серийный номер", "Ед. изм.", "Кол-во", "Дата ввода", "Место установки", "Примечание"];
    const headerRow = worksheet.addRow(headers);

    // Применяем стили к заголовкам
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C3E50' } // Темно-синий фон
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }, // Белый текст
        size: 10
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });

    // 4. Данные (центрированные)
    data.forEach(item => {
      const row = worksheet.addRow([
        item.display_id || "-",
        item.category || "-",
        item.name || "-",
        item.serialNumber || "-",
        item.unit || "-",
        item.quantity ?? "-",
        item.dateAdded ? new Date(item.dateAdded) : "-",
        item.location || "-",
        item.notes || "-"
      ]);

      // Стиль для данных
      row.eachCell((cell) => {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        };
        cell.font = {
          name: 'Calibri',
          size: 9,
          color: { argb: 'FF333333' } // Темно-серый
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
        };
      });

      // Формат даты
      const dateCell = row.getCell(7);
      if (dateCell.value instanceof Date) {
        dateCell.numFmt = 'dd.mm.yyyy';
      }
    });

    // 5. Ширина столбцов
    worksheet.columns = [
      { width: 8 },  // №
      { width: 20 }, // Категория
      { width: 30 }, // Наименование
      { width: 20 }, // Серийный номер
      { width: 12 }, // Ед. изм.
      { width: 12 }, // Кол-во
      { width: 15 }, // Дата ввода
      { width: 25 }, // Место установки
      { width: 30 }  // Примечание
    ];

    // 6. Сохранение файла
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(blob, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}

export default ExcelExportService;