import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiSearch, FiDownload } from 'react-icons/fi';
import './InvoicesStyle.css';
import AddInvoice from './modals/AddInvoice';
import DeleteInvoice from './modals/DeleteInvoice';
import { notify } from '../../utils/notify';

function InvoicesTable() {
  const [invoices, setInvoices] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modal, setModal] = useState({ add: false, delete: false });

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice.id === selectedInvoice?.id ? null : invoice);
    setExpandedRow(invoice.id === expandedRow ? null : invoice.id);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInvoice || !selectedInvoice.id) {
      notify.error('Выберите запись для удаления');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        notify.error('Требуется авторизация');
        return;
      }

      await axios.delete(`/api/invoices/${selectedInvoice.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      notify.deleteSuccess('Запись успешно удалена');
      await fetchInvoices();

      setModal(prev => ({ ...prev, delete: false }));
      setSelectedInvoice(null);
      setExpandedRow(null);
    } catch (error) {
      const errorMessage =
        error.response?.status === 404
          ? 'Запись не найдена (возможно, уже удалена)'
          : error.response?.data?.message || 'Ошибка при удалении записи';
      notify.error(errorMessage);
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedInvoices = useMemo(() => {
    const sortableItems = [...invoices];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [invoices, sortConfig]);

  const filteredInvoices = useMemo(() => {
    return sortedInvoices.filter(invoice =>
      Object.values(invoice).some(
        val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }, [sortedInvoices, searchTerm]);

  const renderHeader = (key, title) => {
    const isSorted = sortConfig.key === key;
    const sortDirection = isSorted ? sortConfig.direction : null;
    
    return (
      <th 
        onClick={() => requestSort(key)}
        data-sort-direction={isSorted ? sortConfig.direction : null}
      >
        <div className="invoices-sort-header-content">
          <span className="invoices-sort-header-text">
            {title}
          </span>
        </div>
      </th>
    );
  };

  if (loading) return <div className="invoices-loading">Загрузка накладных...</div>;
  if (error) return <div className="invoices-error">Ошибка: {error}</div>;

  return (
    <div className="invoices-container">
      <div className="invoices-header">
        <div className="invoices-search-container">
          <FiSearch className="invoices-search-icon" />
          <input
            className="invoices-search-input"
            type="text"
            placeholder="Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="invoices-button-group">
          <button 
            className="invoices-btn invoices-primary"
            onClick={() => setModal({ ...modal, add: true })}
          >
            Добавить накладную
          </button>
        </div>
      </div>

      <div className="invoices-table-responsive">
        <table className="invoices-table">
          <thead>
            <tr>
              {renderHeader('display_id', '№')}
              {renderHeader('invoice_number', '№ Акта')}
              {renderHeader('invoice_type', 'Тип')}
              {renderHeader('invoice_date', 'Дата')}
              {renderHeader('sdal', 'Сдал')}
              {renderHeader('prinyal', 'Принял')}
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <React.Fragment key={invoice.id}>
                <tr 
                  onClick={() => handleRowClick(invoice)}
                  className={`invoices-main-row ${expandedRow === invoice.id ? 'invoices-selected' : ''}`}
                >
                  <td className="invoices-centered-column">{invoice.display_id || '-'}</td>
                  <td>{invoice.invoice_number || '-'}</td>
                  <td>{invoice.invoice_type || '-'}</td>
                  <td className="invoices-centered-column">
                    {new Date(invoice.invoice_date).toLocaleDateString('ru-RU') || '-'}
                  </td>
                  <td>{invoice.sdal || '-'}</td>
                  <td>{invoice.prinyal || '-'}</td>
                </tr>

                {expandedRow === invoice.id && (
                  <tr className="invoices-expanded-row">
                    <td colSpan="6">
                      <div className="invoices-expanded-content">
                        <div className="invoices-items-grid">
                          {invoice.items.map((item, index) => (
                            <div key={item.id} className="invoices-item-card">
                              <div className="invoices-item-header">
                                <span className="invoices-item-number">{index + 1}</span>
                                <span className="invoices-item-name">{item.name || '-'}</span>
                              </div>
                              <div className="invoices-item-details">
                                <div className="invoices-item-detail">
                                  <span className="invoices-item-label">Серийный номер:</span>
                                  <span>{item.serial_number || '-'}</span>
                                </div>
                                <div className="invoices-item-detail">
                                  <span className="invoices-item-label">Количество:</span>
                                  <span>{item.quantity || '0'} {item.unit || 'шт.'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <div className="invoices-action-panel">
          <button 
            className="invoices-btn invoices-danger-btn"
            onClick={() => setModal({ ...modal, delete: true })}
          >
            <FiTrash2 /> Удалить
          </button>
        </div>
      )}

      <AddInvoice 
        isOpen={modal.add}
        onClose={() => setModal({ ...modal, add: false })}
        onSave={fetchInvoices}
      />

      <DeleteInvoice 
        isOpen={modal.delete}
        onClose={() => setModal({ ...modal, delete: false })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default InvoicesTable;