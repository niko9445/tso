  import React, { useState } from 'react';
  import axios from 'axios';
  import { FiPlus, FiX, FiTrash2 } from 'react-icons/fi';
  import './AddModalStyle.css';
  import { notify } from '../../../utils/notify';

  const AddInvoice = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      invoiceNumber: '',
      type: 'приход',
      invoiceDate: new Date().toISOString().split('T')[0],
      sdal: '',
      prinyal: '',
      items: [
        {
          name: '',
          serialNumber: '',
          unit: 'шт.',
          quantity: ''
        }
      ]
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
      const newErrors = {};
      
      if (!formData.invoiceNumber.trim()) {
        newErrors.invoiceNumber = 'Обязательное поле';
      }
      
      if (!formData.type) {
        newErrors.type = 'Выберите тип';
      }
      
      if (!formData.invoiceDate) {
        newErrors.invoiceDate = 'Укажите дату';
      }
      
      if (!formData.sdal.trim()) {
        newErrors.sdal = 'Обязательное поле';
      }
      
      if (!formData.prinyal.trim()) {
        newErrors.prinyal = 'Обязательное поле';
      }
      
      formData.items.forEach((item, index) => {
        if (!item.name.trim()) {
          newErrors[`items[${index}].name`] = 'Обязательное поле';
        }
        if (!item.quantity) {
          newErrors[`items[${index}].quantity`] = 'Обязательное поле';
        }
      });
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validate()) return;

      setIsSubmitting(true);
      try {
        const token = localStorage.getItem('token');

        const payload = {
          invoice_number: formData.invoiceNumber,
          invoice_type: formData.type,
          invoice_date: formData.invoiceDate,
          sdal: formData.sdal,
          prinyal: formData.prinyal,
          items: formData.items.map(item => ({
            name: item.name,
            serial_number: item.serialNumber,
            unit: item.unit,
            quantity: item.quantity
          }))
        };

        await axios.post('/api/invoices', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Если onSave асинхронный - ждем его
        onSave();
        notify.addSuccess('Накладная успешно добавлена');  // Вызов уведомления **после** сохранения
        onClose();

      } catch (error) {
        notify.error(error.response?.data?.message || 'Ошибка при добавлении накладной');
        console.error('Ошибка при добавлении накладной:', error);

        if (error.response?.data?.message) {
          setErrors({ ...errors, server: error.response.data.message });
        } else {
          setErrors({ ...errors, server: 'Ошибка при сохранении' });
        }
      } finally {
        setIsSubmitting(false);
      }
    };


    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleItemChange = (index, e) => {
      const { name, value } = e.target;
      const newItems = [...formData.items];
      newItems[index][name] = value;
      setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            name: '',
            serialNumber: '',
            unit: 'шт.',
            quantity: ''
          }
        ]
      });
    };

    const removeItem = (index) => {
      if (formData.items.length <= 1) return;
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    };

    if (!isOpen) return null;

    return (
      <div className="invmodal-overlay">
        <div className="invmodal">
          <div className="invmodal-header">
            <h3>Добавить накладную</h3>
            <button className="invmodal-close" onClick={onClose}>
              <FiX />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="invmodal-content">
              {errors.server && (
                <div className="invmodal-error-message" style={{ marginBottom: '20px' }}>
                  {errors.server}
                </div>
              )}
              
              <div className="invmodal-form-row">
                <div className={`invmodal-form-group ${errors.invoiceNumber ? 'has-error' : ''}`}>
                  <label>
                    № Акта <span className="invmodal-required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    className="invmodal-form-input"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    placeholder="Введите номер акта"
                  />
                  {errors.invoiceNumber && (
                    <span className="invmodal-error-message">{errors.invoiceNumber}</span>
                  )}
                </div>
                
                <div className={`invmodal-form-group ${errors.type ? 'has-error' : ''}`}>
                  <label>
                    Тип <span className="invmodal-required-mark">*</span>
                  </label>
                  <select
                    className="invmodal-form-select"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="приход">Приход</option>
                    <option value="расход">Расход</option>
                  </select>
                  {errors.type && (
                    <span className="invmodal-error-message">{errors.type}</span>
                  )}
                </div>
                
                <div className={`invmodal-form-group ${errors.invoiceDate ? 'has-error' : ''}`}>
                  <label>
                    Дата <span className="invmodal-required-mark">*</span>
                  </label>
                  <div className="invmodal-date-picker-container">
                    <input
                      type="date"
                      className="invmodal-date-picker-input"
                      name="invoiceDate"
                      value={formData.invoiceDate}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.invoiceDate && (
                    <span className="invmodal-error-message">{errors.invoiceDate}</span>
                  )}
                </div>
              </div>
              
              <div className="invmodal-form-row">
                <div className={`invmodal-form-group ${errors.sdal ? 'has-error' : ''}`}>
                  <label>
                    Сдал <span className="invmodal-required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    className="invmodal-form-input"
                    name="sdal"
                    value={formData.sdal}
                    onChange={handleChange}
                    placeholder="ФИО сдавшего"
                  />
                  {errors.sdal && (
                    <span className="invmodal-error-message">{errors.sdal}</span>
                  )}
                </div>
                
                <div className={`invmodal-form-group ${errors.prinyal ? 'has-error' : ''}`}>
                  <label>
                    Принял <span className="invmodal-required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    className="invmodal-form-input"
                    name="prinyal"
                    value={formData.prinyal}
                    onChange={handleChange}
                    placeholder="ФИО принявшего"
                  />
                  {errors.prinyal && (
                    <span className="invmodal-error-message">{errors.prinyal}</span>
                  )}
                </div>
              </div>
              
              <h4 style={{ margin: '20px 0 10px', color: '#ddd' }}>Товары/Материалы</h4>
              
              {formData.items.map((item, index) => (
                <div key={index} className="invmodal-items-row">
                  <div className={`invmodal-form-group ${errors[`items[${index}].name`] ? 'has-error' : ''}`} style={{ flex: 2 }}>
                    <label>Наименование <span className="invmodal-required-mark">*</span></label>
                    <input
                      type="text"
                      className="invmodal-form-input"
                      name="name"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, e)}
                      placeholder="Наименование товара"
                    />
                    {errors[`items[${index}].name`] && (
                      <span className="invmodal-error-message">{errors[`items[${index}].name`]}</span>
                    )}
                  </div>
                  
                  <div className="invmodal-form-group" style={{ flex: 2 }}>
                    <label>Серийный номер</label>
                    <input
                      type="text"
                      className="invmodal-form-input"
                      name="serialNumber"
                      value={item.serialNumber}
                      onChange={(e) => handleItemChange(index, e)}
                      placeholder="Серийный номер"
                    />
                  </div>
                  
                  <div className="invmodal-form-group" style={{ flex: 1 }}>
                    <label>Ед. изм.</label>
                    <select
                      className="invmodal-form-select"
                      name="unit"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, e)}
                    >
                      <option value="шт.">шт.</option>
                      <option value="к-т">к-т</option>
                      <option value="м.">м.</option>
                      <option value="кг.">кг.</option>
                      <option value="г.">г.</option>
                    </select>
                  </div>
                  
                  <div className={`invmodal-form-group ${errors[`items[${index}].quantity`] ? 'has-error' : ''}`} style={{ flex: 1 }}>
                    <label>Кол-во <span className="invmodal-required-mark">*</span></label>
                    <input
                      type="number"
                      className="invmodal-form-input"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, e)}
                      placeholder="0"
                      min="0"
                    />
                    {errors[`items[${index}].quantity`] && (
                      <span className="invmodal-error-message">{errors[`items[${index}].quantity`]}</span>
                    )}
                  </div>
                  
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      className="invmodal-item-remove"
                      onClick={() => removeItem(index)}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
              
              <div className="invmodal-add-item">
                <button
                  type="button"
                  className="invmodal-add-item-btn"
                  onClick={addItem}
                >
                  <FiPlus /> Добавить строку
                </button>
              </div>
            </div>
            
            <div className="invmodal-footer">
              <button
                type="button"
                className="invmodal-btn invmodal-btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="invmodal-btn invmodal-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default AddInvoice;