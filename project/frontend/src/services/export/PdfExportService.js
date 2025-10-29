// PdfExportService.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PdfExportTemplate as template } from '../templates/pdfTemplate';
import '../../fonts/Roboto-Regular';

class PdfExportService {
  static exportToPDF(data, fileName = template.fileName) {
    try {
      // 1. Создаём документ в альбомной ориентации
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // 2. Устанавливаем шрифт
      doc.setFont('Roboto-Regular');

      // 3. Точные размеры страницы A4 landscape (297x210mm)
      const pageWidth = 297;
      const margins = {
        left: 10,
        right: 10,
        top: 20,
        bottom: 15
      };

      // 4. Доступная ширина для таблицы (с учетом уменьшения на 1mm с каждой стороны для границ)
      const tableWidth = pageWidth - margins.left - margins.right - 2; // -2mm для границ

      // 5. Настройка колонок
      const columnStyles = {
        0: { cellWidth: 10, halign: 'center', valign: 'middle' },
        1: { cellWidth: 40, halign: 'center', valign: 'middle' },
        2: { cellWidth: 59, halign: 'center', valign: 'middle' },
        3: { cellWidth: 45, halign: 'center', valign: 'middle' },
        4: { cellWidth: 18, halign: 'center', valign: 'middle' },
        5: { cellWidth: 18, halign: 'center', valign: 'middle' },
        6: { cellWidth: 25, halign: 'center', valign: 'middle' },
        7: { cellWidth: 30, halign: 'center', valign: 'middle' },
        8: { cellWidth: 30, halign: 'center', valign: 'middle' }
      };

      // 6. Подготовка данных
      const tableData = data.map(item => [
        item.display_id,
        item.category || "-",
        item.name || "-",
        item.serialNumber || "-",
        item.unit || "-",
        item.quantity ?? "-",
        item.dateAdded ? new Date(item.dateAdded).toLocaleDateString("ru-RU") : "-",
        item.location || "-",
        item.notes || "-"
      ]);

      // 7. Добавляем заголовок и дату
      doc.setFontSize(template.styles.title.fontSize);
      doc.setTextColor(template.styles.title.textColor);
      doc.text(template.title, pageWidth / 2, margins.top, { align: 'center' });
      
      const exportDate = new Date().toLocaleDateString("ru-RU");
      doc.setFontSize(template.styles.date.fontSize);
      doc.text(`Дата экспорта: ${exportDate}`, pageWidth / 2, margins.top + 8, { align: 'center' });

      // 8. Генерация таблицы с правильными границами
      doc.autoTable({
        head: [template.headers],
        body: tableData,
        startY: margins.top + 16,
        margin: { 
          top: margins.top + 16,
          left: margins.left + 1, // +1mm для внутреннего отступа границы
          right: margins.right + 1,
          bottom: margins.bottom
        },
        tableWidth: tableWidth,
        columnStyles,
        headStyles: {
          ...template.styles.header,
          cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
          lineWidth: 0.1 // Толщина границы заголовка
        },
        bodyStyles: {
          ...template.styles.body,
          cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
          lineWidth: 0.1 // Толщина границы тела таблицы
        },
        styles: {
          font: 'Roboto-Regular',
          fontSize: 9,
          overflow: 'linebreak',
          lineWidth: 0.1,
          lineColor: '#d0d0d0'
        },
        pageBreak: 'auto',
        rowPageBreak: 'avoid',
        showHead: 'everyPage',
        tableLineWidth: 0.1, // Толщина внешней рамки
        tableLineColor: '#d0d0d0' // Цвет внешней рамки
      });

      // 9. Сохранение файла
      doc.save(fileName);

    } catch (error) {
      console.error("PDF Export Error:", error);
      throw new Error("Не удалось создать PDF документ");
    }
  }
}

export default PdfExportService;