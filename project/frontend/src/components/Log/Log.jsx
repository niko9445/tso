import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import "./LogStyle.css";

const LogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [changedFieldsMap, setChangedFieldsMap] = useState({});

  const fieldLabels = {
    id: "ID",
    invoice_number: "Номер накладной",
    invoice_type: "Тип накладной",
    serial_number: "Серийный номер",
    serialNumber: "Серийный номер",
    category: "Категория",
    unit: "Ед.изм.",
    dateAdded: "Дата ввода",
    location: "Место установки",
    notes: "Примечание",
    quantity: "Количество",
    items_count: "Количество позиций",
    display_id: "Номер в списке",
    name: "Наименование",
    description: "Описание",
    created_at: "Дата создания",
    updated_at: "Дата обновления",
  };

  const findChangedFields = (oldObj, newObj) => {
    if (!oldObj || !newObj) return [];
    
    try {
      const oldData = typeof oldObj === 'string' ? JSON.parse(oldObj) : oldObj;
      const newData = typeof newObj === 'string' ? JSON.parse(newObj) : newObj;
      
      const changedFields = new Set();
      
      Object.keys(oldData).forEach(key => {
        if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
          changedFields.add(key);
        }
      });
      
      Object.keys(newData).forEach(key => {
        if (!(key in oldData)) {
          changedFields.add(key);
        }
      });
      
      return Array.from(changedFields);
    } catch (error) {
      console.error('Error comparing objects:', error);
      return [];
    }
  };

  const formatSpecialValue = (key, value) => {
    if (value === null || value === undefined) return "не указано";
    
    if (key === 'invoice_type') {
      return value === 'расход' ? 'Списание' : 'Поступление';
    }
    
    if (key === 'created_at' || key === 'updated_at' || key === 'timestamp') {
      return format(new Date(value), 'dd.MM.yyyy HH:mm', { locale: ru });
    }
    
    return String(value);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/api/logs');
        setLogs(response.data);
        
        const changes = {};
        response.data.forEach(log => {
          if (log.old_value && log.new_value) {
            changes[log.id] = findChangedFields(log.old_value, log.new_value);
          }
        });
        setChangedFieldsMap(changes);
      } catch (error) {
        console.error('Ошибка загрузки логов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const toggleExpand = (logId) => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const formatAction = (action) => {
    const actions = {
      create: 'Создание',
      update: 'Обновление',
      delete: 'Удаление',
      login: 'Вход',
      logout: 'Выход'
    };
    return actions[action] || action;
  };

  const formatEntity = (entity) => {
    const entities = {
      user: 'Пользователь',
      inventory: "Общий учёт",
      invoice: 'Накладная',
      item: 'Товар',
      invoice_item: 'Позиция накладной'
    };
    return entities[entity] || entity;
  };

  const formatValue = (value, logId, isOldValue = false) => {
    if (!value) return <div className="no-data">Нет данных</div>;
    
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      const changedFields = changedFieldsMap[logId] || [];
      
      if (typeof parsed === 'object' && parsed !== null) {
        return (
          <div className="log-details-grid">
            {Object.entries(parsed).map(([key, val]) => {
              const isChanged = changedFields.includes(key);
              const isRemoved = isOldValue && isChanged && 
                (!parsed[key] || !JSON.parse(logs.find(l => l.id === logId)?.new_value || '{}')?.[key]);
              const isAdded = !isOldValue && isChanged && 
                (!JSON.parse(logs.find(l => l.id === logId)?.old_value || '{}')?.[key]);
              
              return (
                <React.Fragment key={key}>
                  <div className={`log-detail-key ${isChanged ? 'changed' : ''}`}>
                    {fieldLabels[key] || key}
                    {isChanged && <span className="change-indicator">*</span>}
                  </div>
                  <div className={`log-detail-value 
                    ${isChanged ? 'changed' : ''} 
                    ${isRemoved ? 'removed' : ''}
                    ${isAdded ? 'added' : ''}`}>
                    {formatSpecialValue(key, val)}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        );
      }
      return <div className="log-single-value">{String(parsed)}</div>;
    } catch {
      return <div className="log-single-value">{String(value)}</div>;
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <span>Загрузка логов...</span>
    </div>
  );

  return (
    <div className="logs-container">
      <h2 className="logs-title">История действий</h2>
      <div className="logs-list">
        {logs.map(log => (
          <div 
            key={log.id} 
            className={`log-entry ${expandedLogs[log.id] ? 'expanded' : ''}`}
            onClick={() => toggleExpand(log.id)}
          >
            <div className="log-header">
              <div className="log-main-info">
                <span className="log-timestamp">
                  {format(new Date(log.timestamp), 'dd.MM.yyyy HH:mm:ss', { locale: ru })}
                </span>
                <span className="log-entity">{formatEntity(log.entity)}</span>
                {log.user && <span className="log-user">{log.user}</span>}
              </div>
              
              <span className={`log-action log-action-${log.action}`}>
                {formatAction(log.action)}
              </span>
              
              <span className="log-expand-icon">
                {expandedLogs[log.id] ? '▲' : '▼'}
              </span>
            </div>
            
            {expandedLogs[log.id] && (
              <div className="log-details">
                {log.old_value && (
                  <div className="log-change">
                    <div className="log-change-label">Было:</div>
                    <div className="log-change-value">
                      {formatValue(log.old_value, log.id, true)}
                    </div>
                  </div>
                )}
                
                {log.new_value && (
                  <div className="log-change">
                    <div className="log-change-label">Стало:</div>
                    <div className="log-change-value">
                      {formatValue(log.new_value, log.id)}
                    </div>
                  </div>
                )}
                
                {log.description && (
                  <div className="log-description">
                    <div className="log-change-label">Комментарий:</div>
                    <div className="log-change-value">{log.description}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogsViewer;