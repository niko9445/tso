import React from 'react';
import { ToastContainer } from 'react-toastify';
import './notifyStyle.css';

export const ToastFix = () => {
  return (
    <div className="toast-warpper" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      width: '380px'
    }}>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false} // Правильное написание (с заглавной H)
        theme="dark"
        style={{
            bottom: "1rem",
            right: "1rem",
        }}
        toastStyle={{
            margin: "0 0 16px 0",
            background: "#1E1E1E",
            color: "#F0F0F0",
            borderRadius: "8px",
        }}
        />
    </div>
  );
};