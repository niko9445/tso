import { toast } from 'react-toastify';

export const notify = {
  // Успешное добавление
  addSuccess: (message) => toast.success(message, {
    className: 'toast-add',
    position: "bottom-right",
    autoClose: 3000,
  }),

  // Успешное редактирование
  editSuccess: (message) => toast.success(message, {
    className: 'toast-edit',
    position: "bottom-right",
    autoClose: 3000,
  }),

  // Успешное удаление
  deleteSuccess: (message) => toast.success(message, {
    className: 'toast-delete',
    position: "bottom-right",
    autoClose: 3000,
  }),

  // Успешный экспорт
  exportSuccess: (message) => toast.success(message, {
    className: 'toast-export',
    position: "bottom-right",
    autoClose: 3000,
  }),

  // Ошибки
  error: (message) => toast.error(message, {
    className: 'toast-error',
    position: "bottom-right",
    autoClose: 5000,
  }),
  
  info: (message) => toast.info(message),
  warning: (message) => toast.warning(message)
};