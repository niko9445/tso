import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiSearch, FiDownload } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import AddEditTSO from './modals/AddEditTSO';
import DeleteTSO from './modals/DeleteTSO';
import ExportTSO from './modals/ExportTSO';
import "./TSOTableStyle.css";
import { notify } from '../../utils/notify';
import CategoryFilter from './CategoryFilter';



function TSOTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [exportModal, setExportModal] = useState({
    open: false,
    data: [],
  });
  const [categoryFilter, setCategoryFilter] = useState(null);

  const [sortConfig, setSortConfig] = useState({ 
    key: null, 
    direction: 'ascending' 
  });
  const [modal, setModal] = useState({
    open: false,
    mode: 'add',
    item: null
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    itemId: null
  });

  const defaultItem = {
    category: '',
    name: '',
    serialNumber: '',
    unit: '',
    quantity: '',
    location: '',
    notes: ''
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/tso', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        notify.error('Требуется авторизация');
        return;
      }

      await axios.delete(`/api/tso/${deleteModal.itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Используем специальное уведомление для удаления
      notify.deleteSuccess('Запись успешно удалена');
      
      // Закрываем модалку и обновляем данные
      setDeleteModal({ open: false, itemId: null });
      await fetchItems();

    } catch (error) {
      console.error('Ошибка удаления:', error);
      
      // Более детальное сообщение об ошибке
      const errorMessage = error.response?.status === 404
        ? 'Запись не найдена (возможно, уже удалена)'
        : error.response?.data?.message || 'Ошибка при удалении записи';
      
      notify.error(errorMessage);
    }
  };  

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const filteredItems = useMemo(() => {
    let result = items; // Создаем временную переменную
    
    // Применяем поиск если есть searchTerm
    if (searchTerm) {
      result = result.filter(item => 
        Object.values(item).some(
          val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Применяем фильтр по категории если есть categoryFilter
    if (categoryFilter) {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    return result; // Возвращаем окончательный результат
  }, [items, searchTerm, categoryFilter]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = useMemo(() => {
    const sortableItems = [...filteredItems];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        // 1. Колонка "№" (display_id) - числовая сортировка
        if (sortConfig.key === 'display_id') {
          const valA = a.displayId !== null ? Number(a.displayId) : -Infinity;
          const valB = b.displayId !== null ? Number(b.displayId) : -Infinity;
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }

        // 2. Колонка "Количество" (quantity) - числовая сортировка
        if (sortConfig.key === 'quantity') {
          const valA = a.quantity !== null ? Number(a.quantity) : -Infinity;
          const valB = b.quantity !== null ? Number(b.quantity) : -Infinity;
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }

        // 3. Колонка "Дата" (dateAdded) - сортировка по дате
        if (sortConfig.key === 'date_added') {
          const dateA = a.dateAdded ? new Date(a.dateAdded) : new Date(0);
          const dateB = b.dateAdded ? new Date(b.dateAdded) : new Date(0);
          return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }

        // 4. Текстовые колонки (алфавитная сортировка):
        // - Категория (category)
        // - Наименование (name)
        // - Серийный номер (serialNumber)
        // - Место установки (location)
        // - Примечание (notes)
        // - Ед.измерения (unit)
        const aValue = String(a[sortConfig.key] || '').toLowerCase();
        const bValue = String(b[sortConfig.key] || '').toLowerCase();
        
        // Улучшенное сравнение для русского языка
        const comparison = aValue.localeCompare(bValue, 'ru', {
          sensitivity: 'base', // Игнорирует регистр и акценты
          numeric: true // Для правильной сортировки чисел внутри строк
        });
        
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [filteredItems, sortConfig]);

 
  const handleRowClick = (item) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  const handleRowDoubleClick = (item) => {
    setModal({
      open: true,
      mode: 'edit',
      item: { ...item }
    });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const renderHeader = (key, title) => {
    const isSorted = sortConfig.key === key;
    const sortDirection = isSorted ? sortConfig.direction : null;
    
    return (
      <th 
        className="centered-column"
        onClick={() => requestSort(key)}
        data-sort-direction={isSorted ? sortConfig.direction : null}
      >
        <div className="sort-header-content">
          <span className="sort-header-text">
            {title}
          </span>
        </div>
      </th>
    );
  };

  if (loading) return <div className="status-message">Загрузка...</div>;
  if (error) return <div className="status-message error">{error}</div>;

  return (
    <div className="tso-container" onClick={() => setSelectedItem(null)}>
      <div className="tso-header">
        <div className="search-and-filter">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              className="search-input"
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <CategoryFilter 
            items={items}
            onFilterChange={setCategoryFilter}
          />

          <div className="button-group">
            <button
              className="btn primary"
              onClick={(e) => {
                e.stopPropagation();
                setModal({ open: true, mode: 'add', item: defaultItem });
              }}
            >
              Добавить ТСО
            </button>
            <button
              className="btn export-btn"
              onClick={(e) => {
                e.stopPropagation();
                setExportModal({ open: true, data: sortedItems });
              }}
            >
              <FiDownload /> Экспорт
            </button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="tso-table">
          <thead>
            <tr>
              {renderHeader('displayId', '№')}
              {renderHeader('category', 'Категория')}
              {renderHeader('name', 'Наименование')}
              {renderHeader('serialNumber', 'Серийный номер')}
              {renderHeader('unit', 'Ед. изм.')}
              {renderHeader('quantity', 'Кол-во')}
              {renderHeader('dateAdded', 'Дата ввода')}
              {renderHeader('location', 'Место установки')}
              {renderHeader('notes', 'Примечание')}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sortedItems.map((item) => (
                <motion.tr
                  key={item.id}
                  className={selectedItem?.id === item.id ? 'selected' : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(item);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleRowDoubleClick(item);
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="centered-column">{item.displayId || '-'}</td>
                  <td className="centered-column">{item.category || '-'}</td>
                  <td className="centered-column">{item.name || '-'}</td>
                  <td className="centered-column">{item.serialNumber || '-'}</td>
                  <td className="centered-column">{item.unit || '-'}</td>
                  <td className="centered-column">{item.quantity ?? '-'}</td>
                  <td className="centered-column">
                    {item.date_ardded ? new Date(item.dateAdded).toLocaleDateString('ru-RU') : '-'}
                  </td>
                  <td className="centered-column">{item.location || '-'}</td>
                  <td className="centered-column">{item.notes || '-'}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <div className="action-panel" onClick={(e) => e.stopPropagation()}>
          <button 
            className="btn edit-btn"
            onClick={() => {
              setModal({
                open: true,
                mode: 'edit',
                item: { ...selectedItem }
              });
            }}
          >
            <FiEdit /> Редактировать
          </button>
          <button 
            className="btn danger-btn"
            onClick={() => setDeleteModal({
              open: true,
              itemId: selectedItem.id
            })}
          >
            <FiTrash2 /> Удалить
          </button>
        </div>
      )}

      <AddEditTSO
        isOpen={modal.open}
        mode={modal.mode}
        item={modal.item || defaultItem} 
        onClose={() => setModal({ open: false, mode: 'add', item: null })}
        onSave={async (savedItem) => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              notify.error('Требуется авторизация');
              return;
            }

            const url = modal.mode === 'add' 
              ? '/api/tso' 
              : `/api/tso/${modal.item.id}`;
            
            const method = modal.mode === 'add' ? 'post' : 'put';

            const response = await axios[method](url, savedItem, {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            await fetchItems();
            setModal({ open: false, mode: 'add', item: null });
            
            // Разные уведомления для добавления и редактирования
            if (modal.mode === 'add') {
              notify.addSuccess('Новая запись успешно добавлена');
            } else {
              notify.editSuccess('Изменения успешно сохранены');
            }

          } catch (err) {
            console.error('Ошибка сохранения:', err);
            
            const errorMessage = err.response?.data?.message || 
              'Произошла ошибка при сохранении';
            
            notify.error(errorMessage);
            setError(errorMessage);
          }
        }}
      />

      <DeleteTSO 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, itemId: null })}
        onConfirm={handleDeleteConfirm}
        className="dark-modal"
        overlayClassName="dark-overlay"
      />

      <ExportTSO
        isOpen={exportModal.open}
        onClose={() => setExportModal({ open: false, data: [] })}
        data={exportModal.data}
        className="dark-modal"
        overlayClassName="dark-overlay"
      />
    </div>
  );
}

export default TSOTable;