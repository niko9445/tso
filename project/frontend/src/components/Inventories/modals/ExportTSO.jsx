import { useState } from 'react';
import "./ExportTSOStyle.css";
import ExcelExportService from '../../../services/export/ExcelExportService';
import PdfExportService from '../../../services/export/PdfExportService';
import { FiFileText, FiDownload } from 'react-icons/fi';
import { notify } from '../../../utils/notify';

function ExportTSO({ isOpen, onClose, data }) {
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportAll, setExportAll] = useState(true);
  const [fileName, setFileName] = useState('ТСО_экспорт');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!data || data.length === 0) {
      notify.error('Нет данных для экспорта');
      return;
    }

    setIsExporting(true);

    try {
      if (exportFormat === 'excel') {
        await ExcelExportService.exportToExcel(data, fileName);
      } else {
        await PdfExportService.exportToPDF(data, fileName);
      }
      notify.exportSuccess(`Данные экспортированы в ${exportFormat.toUpperCase()}`);
      onClose();
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      notify.error(error.message || 'Ошибка при экспорте');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="exp-modal-overlay" onClick={onClose}>
      <div className="exp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="exp-modal-header">
          <FiFileText className="exp-header-icon" />
          <h2>Экспорт данных</h2>
        </div>
        
        <div className="exp-modal-content">
          <div className="exp-form-group">
            <label>Формат:</label>
            <select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
              className="exp-form-select"
              disabled={isExporting}
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="pdf">PDF (.pdf)</option>
            </select>
          </div>

          <div className="exp-form-group">
            <label>Имя файла:</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="exp-form-input"
              disabled={isExporting}
            />
          </div>

          <div className="exp-checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={exportAll}
                onChange={() => setExportAll(!exportAll)}
                disabled={isExporting}
              />
              <span>Экспортировать все записи (включая неотображаемые)</span>
            </label>
          </div>
        </div>

        <div className="exp-modal-actions">
          <button 
            className="exp-btn exp-cancel-btn" 
            onClick={onClose}
            disabled={isExporting}
          >
            Отмена
          </button>
          <button 
            className="exp-btn exp-export-btn" 
            onClick={handleExport}
            disabled={isExporting || !data || data.length === 0}
          >
            <FiDownload className="exp-btn-icon" />
            <span>{isExporting ? 'Экспортируется...' : 'Экспорт'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportTSO;