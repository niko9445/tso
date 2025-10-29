import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaLaptop, 
  FaFileAlt, 
  FaArchive, 
  FaFileInvoice,
  FaSignOutAlt 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import "./SidebarStyle.css";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setCollapsed(true);
      else setCollapsed(false);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div 
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      initial={false}
      animate={{ width: collapsed ? 80 : 250 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Область для сворачивания */}
      <div 
        className="collapse-handle"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={toggleCollapse}
      >
        <motion.div
          className="handle-indicator"
          animate={{ 
            backgroundColor: hovered ? '#6c5ce7' : 'transparent',
            width: hovered ? '4px' : '2px'
          }}
        />
      </div>

      {/* Навигационные пункты */}
      <nav className="sidebar-nav">
        {[
          { to: 'tso', icon: <FaLaptop />, text: 'Учет ТСО' },
          { to: 'invoices', icon: <FaFileInvoice />, text: 'Накладные' },
          { to: 'logs', icon: <FaArchive />, text: 'Архив' },
        ].map((item) => (
          <NavLink 
            key={item.to}
            to={item.to}
            className="sidebar-item"
          >
            <motion.div
              className="item-content"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="item-icon">{item.icon}</span>
              {!collapsed && (
                <motion.span 
                  className="item-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {item.text}
                </motion.span>
              )}
              {location.pathname.includes(item.to) && (
                <motion.div 
                  className="active-indicator"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.div>
          </NavLink>
        ))}
      </nav>

      {/* Кнопка выхода - исправленная версия */}
      <div className="sidebar-footer">
        <motion.div 
          className="logout-container"
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="logout-content">
            <span className="logout-icon"><FaSignOutAlt /></span>
            {!collapsed && (
              <span className="logout-text">Выйти</span>
            )}
          </div>
          <div className="logout-hover-effect" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Sidebar;