import React from 'react';
import './AuthOptionButton.css';

const AuthOptionButton = ({ icon, label, onClick, className = '' }) => {
    return (
        <button className={`auth-option-button ${className}`} onClick={onClick}>
            {icon && <span className="auth-option-icon">{icon}</span>}
            <span className="auth-option-label">{label}</span>
        </button>
    );
};

export default AuthOptionButton;
