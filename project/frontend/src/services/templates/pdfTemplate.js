// pdfTemplate.js
import '../../fonts/Roboto-Regular';

export const PdfExportTemplate = {
  title: "Технические средства охраны",
  fileName: "ТСО_экспорт.pdf",
  
  // Заголовки колонок
  headers: [
    "№", 
    "Категория", 
    "Наименование", 
    "Серийный номер", 
    "Ед. изм.",
    "Кол-во", 
    "Дата ввода", 
    "Место установки", 
    "Примечание"
  ],

  // Стили элементов
  styles: {
    title: {
      fontSize: 16,
      textColor: "#2c3e50",
      alignment: "center"
    },
    date: {
      fontSize: 12,
      textColor: "#2c3e50",
      alignment: "center"
    },
    header: {
      fillColor: "#2c3e50",
      textColor: "#ffffff",
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: 4,
      halign: 'center',
      valign: 'middle'
    },
    body: {
      textColor: "#333333",
      fontSize: 9,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle'
    }
  }
};