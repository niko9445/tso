import { useState, useEffect } from 'react';
import { FiX, FiSave, FiCalendar } from 'react-icons/fi';
import './modalstyle.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
registerLocale("ru", ru);

const categoryOptions = [
  'Видеокамеры',
  'С2000',
  'Кнопки',
  'Извещатели',
  'Оповещатели',
  'Коммутаторы',
  'Другое'
];

const unitOptions = [
  'шт.',
  'к-т',
  'м.',
  'кг.',
  'г.'
];

const fieldConfig = {
  category: { label: 'Категория', required: true, type: 'select', options: categoryOptions },
  name: { label: 'Наименование', required: true },
  serialNumber: { label: 'Серийный номер' },
  unit: { label: 'Ед. измерения', required: true, type: 'select', options: unitOptions },
  quantity: { label: 'Кол-во', type: 'number', required: true },
  dateAdded: { label: 'Дата добавления', type: 'date' },
  location: { label: 'Место установки' },
  notes: { label: 'Примечания', type: 'textarea' }  
};

export default function AddEditTSO({ isOpen, mode, item, onClose, onSave }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initialData = {};
      Object.keys(fieldConfig).forEach(key => {
        initialData[key] = item?.[key] || '';
      });
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleDateChange = (date, name) => {
    setFormData(prev => ({ ...prev, [name]: date }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateField = (name, value) => {
    if (fieldConfig[name].required && !value) {
      return `Поле обязательно для заполнения`;
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    let hasErrors = false;
    
    Object.entries(fieldConfig).forEach(([field, config]) => {
      if (config.required && !formData[field]) {
        newErrors[field] = validateField(field, formData[field]);
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    
    if (hasErrors) {
      const errorFields = document.querySelectorAll('.cmn-form-group.has-error');
      errorFields.forEach(field => {
        field.classList.add('cmn-vibrate');
        setTimeout(() => field.classList.remove('cmn-vibrate'), 500);
      });
      return;
    }
    
    onSave({
      ...formData,
      dateAdded: formData.dateAdded || new Date()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="cmn-modal-overlay" onClick={onClose}>
      <div className={`cmn-modal ${mode === 'add' ? 'cmn-modal-add' : 'cmn-modal-edit'}`} onClick={e => e.stopPropagation()}>
        <div className="cmn-modal-header">
          <div className="cmn-header-content">
            <h3>{mode === 'add' ? 'Новое ТСО' : 'Редактировать'}</h3>
          </div>
          <button className="cmn-modal-close" onClick={onClose} aria-label="Закрыть">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cmn-modal-form">
          <div className="cmn-modal-content">
            <div className="cmn-form-fields">
              <div className={`cmn-form-group ${errors.category ? 'has-error' : ''}`}>
                <label htmlFor="category">
                  Категория
                  <span className="cmn-required-mark">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  className="cmn-form-select"
                >
                  <option value="">Выберите...</option>
                  {categoryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.category && <div className="cmn-error-message">{errors.category}</div>}
              </div>

              <div className={`cmn-form-group ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="name">
                  Наименование
                  <span className="cmn-required-mark">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="cmn-form-input"
                />
                {errors.name && <div className="cmn-error-message">{errors.name}</div>}
              </div>

              <div className="cmn-form-group">
                <label htmlFor="serialNumber">Серийный номер</label>
                <input
                  id="serialNumber"
                  name="serialNumber"
                  type="text"
                  value={formData.serialNumber || ''}
                  onChange={handleChange}
                  className="cmn-form-input"
                />
              </div>

              <div className="cmn-form-row">
                <div className={`cmn-form-group ${errors.unit ? 'has-error' : ''}`}>
                  <label htmlFor="unit">
                    Ед. измерения
                    <span className="cmn-required-mark">*</span>
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit || ''}
                    onChange={handleChange}
                    className="cmn-form-select"
                  >
                    <option value="">Выберите...</option>
                    {unitOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.unit && <div className="cmn-error-message">{errors.unit}</div>}
                </div>

                <div className={`cmn-form-group ${errors.quantity ? 'has-error' : ''}`}>
                  <label htmlFor="quantity">
                    Кол-во
                    <span className="cmn-required-mark">*</span>
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity || ''}
                    onChange={handleChange}
                    className="cmn-form-input"
                  />
                  {errors.quantity && <div className="cmn-error-message">{errors.quantity}</div>}
                </div>
              </div>

              <div className="cmn-form-group">
                <label htmlFor="dateAdded">Дата добавления</label>
                <div className="cmn-date-picker-container">
                  <DatePicker
                    selected={formData.dateAdded ? new Date(formData.dateAdded) : null}
                    onChange={(date) => handleDateChange(date, 'dateAdded')}
                    dateFormat="dd.MM.yyyy"
                    placeholderText="Выберите дату"
                    className="cmn-date-picker-input"
                    locale="ru"
                  />
                  <FiCalendar className="cmn-calendar-icon" />
                </div>
              </div>

              <div className="cmn-form-group">
                <label htmlFor="location">Место установки</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="cmn-form-input"
                />
              </div>

              <div className="cmn-form-group">
                <label htmlFor="notes">Примечания</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  rows={3}
                  className="cmn-form-input"
                />
              </div>
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
              type="submit" 
              className={`cmn-btn ${mode === 'add' ? 'cmn-btn-add' : 'cmn-btn-save'}`}
            >
              <FiSave className="cmn-btn-icon" />
              <span className="cmn-btn-text">
                {mode === 'add' ? 'Добавить' : 'Сохранить'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}