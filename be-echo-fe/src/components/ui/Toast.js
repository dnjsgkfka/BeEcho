import React, { useEffect } from "react";
import "../../styles/toast.css";

const Toast = ({ message, type = "info", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`} onClick={onClose}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;

