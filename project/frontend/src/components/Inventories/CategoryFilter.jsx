import { useState, useEffect, useMemo } from 'react';
import { FiX, FiChevronDown } from 'react-icons/fi';

export default function CategoryFilter({ items, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  // Извлекаем уникальные категории
  useEffect(() => {
    const uniqueCategories = [...new Set(items.map(item => item.category))];
    setCategories(uniqueCategories.filter(Boolean));
  }, [items]);

  // Обработчик выбора категории
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setIsOpen(false);
    onFilterChange(category);
  };

  // Сброс фильтра
  const resetFilter = () => {
    setSelectedCategory(null);
    onFilterChange(null);
  };

  const normalizeUnit = (unit) => {
    if (!unit) return 'шт.';
    const trimmed = unit.trim().toLowerCase();
    if (trimmed === 'шт' || trimmed === 'шт.') return 'шт.';
    // можно добавить и другие варианты нормализации, если надо
    return unit.trim();
  };

  // Функция для расчета количества по единицам измерения
  const calculateQuantities = (itemsArray) => {
    const quantities = {};

    itemsArray.forEach(item => {
      const unit = normalizeUnit(item.unit);
      const quantity = parseFloat(item.quantity) || 0;

      if (!quantities[unit]) {
        quantities[unit] = 0;
      }

      quantities[unit] += quantity;
    });

    const sortedEntries = Object.entries(quantities).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    return Object.fromEntries(sortedEntries);
  };

  // Форматируем результат для отображения
  const formatQuantities = (quantities) => {
    return Object.entries(quantities)
      .map(([unit, total]) => {
        const formattedValue = Number.isInteger(total) 
          ? total.toLocaleString('ru-RU')
          : total.toLocaleString('ru-RU', { maximumFractionDigits: 3 });
        return `${formattedValue} ${unit}`;
      })
      .join(', ');
  };

  // Рассчитываем общие суммы
  const totalQuantities = useMemo(() => calculateQuantities(items), [items]);
  const filteredQuantities = useMemo(() => (
    selectedCategory
      ? calculateQuantities(items.filter(item => item.category === selectedCategory))
      : totalQuantities
  ), [items, selectedCategory, totalQuantities]);

  return (
    <div className="category-filter-wrapper">
      <div className="search-and-filter">
        <div className={`category-filter ${selectedCategory ? 'filter-active' : ''}`}>
          <div 
            className="category-selector"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>
              {selectedCategory || 'Все категории'}
            </span>
            <FiChevronDown className={`dropdown-icon ${isOpen ? 'open' : ''}`} />
          </div>
          
          {isOpen && (
            <div className="category-dropdown">
              <div 
                className="category-item"
                onClick={() => handleSelectCategory(null)}
              >
                Все категории
              </div>
              {categories.map(category => (
                <div
                  key={category}
                  className="category-item"
                  onClick={() => handleSelectCategory(category)}
                >
                  {category}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`total-quantity ${selectedCategory ? 'filter-active' : ''}`}>
          <span>Общее количество: {formatQuantities(filteredQuantities)}</span>
          {selectedCategory && (
            <button 
              className="clear-filter"
              onClick={resetFilter}
              title="Сбросить фильтр"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}