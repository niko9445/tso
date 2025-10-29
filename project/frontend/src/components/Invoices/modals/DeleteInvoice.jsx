import { FiAlertTriangle, FiX, FiTrash2 } from 'react-icons/fi';
import '../../Inventories/modals/modalstyle.css';

export default function DeleteInvoice({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="cmn-modal-overlay" onClick={onClose}>
      <div className="cmn-modal cmn-delete-modal" onClick={e => e.stopPropagation()}>
        <div className="cmn-modal-header">
          <div className="cmn-header-content">
            <FiAlertTriangle className="cmn-header-icon cmn-danger-icon" />
            <h3>Подтверждение удаления</h3>
          </div>
          <button className="cmn-modal-close" onClick={onClose} aria-label="Закрыть">
            <FiX size={20} />
          </button>
        </div>

        <div className="cmn-modal-content">
          <div className="cmn-warning-message">
            <p>Вы уверены, что хотите удалить эту запись?</p>
            <p className="cmn-warning-subtext">Это действие нельзя отменить.</p>
          </div>
        </div>

        <div className="cmn-modal-footer">
          <button 
            type="button" 
            className="cmn-btn cmn-btn-secondary"
            onClick={onClose}
          >
            Отмена
          </button>
          <button 
            type="button" 
            className="cmn-btn cmn-btn-delete"
            onClick={onConfirm}
          >
            <FiTrash2 className="cmn-btn-icon" />
            <span>Удалить</span>
          </button>
        </div>
      </div>
    </div>
  );
}