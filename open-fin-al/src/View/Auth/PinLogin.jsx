// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, useEffect } from 'react';
import { UserAuthInteractor } from '../../Interactor/UserAuthInteractor';

function PinLogin({ onLoginSuccess, onSwitchToRegister, onSwitchToReset }) {
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPin, setShowPin] = useState(false);

    // Initialize auth interactor
    const authInteractor = new UserAuthInteractor();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await authInteractor.loginUser(username, pin);
            
            if (result.success) {
                onLoginSuccess(result.user);
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePinChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 8) {
            setPin(value);
        }
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const isFormValid = username.trim() && pin.length === 8;

    return (
        <div className="pin-login-container">
            <div className="pin-login-card">
                <div className="pin-login-header">
                    <h1 className="pin-login-title">OpenFinAL</h1>
                    <p className="pin-login-subtitle">Financial Analysis & Learning Platform</p>
                </div>

                <form onSubmit={handleSubmit} className="pin-login-form">
                    <div className="pin-login-field">
                        <label htmlFor="username" className="pin-login-label">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            className="pin-login-input"
                            placeholder="Enter your username"
                            disabled={isLoading}
                            autoComplete="username"
                        />
                    </div>

                    <div className="pin-login-field">
                        <label htmlFor="pin" className="pin-login-label">
                            8-Digit PIN
                        </label>
                        <div className="pin-input-container">
                            <input
                                id="pin"
                                type={showPin ? "text" : "password"}
                                value={pin}
                                onChange={handlePinChange}
                                className="pin-login-input pin-input"
                                placeholder="••••••••"
                                maxLength="8"
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="pin-toggle-button"
                                onClick={() => setShowPin(!showPin)}
                                disabled={isLoading}
                                aria-label={showPin ? "Hide PIN" : "Show PIN"}
                            >
                                {showPin ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                        <div className="pin-progress">
                            <div 
                                className="pin-progress-bar" 
                                style={{ width: `${(pin.length / 8) * 100}%` }}
                            ></div>
                        </div>
                        <small className="pin-help-text">
                            {pin.length}/8 digits entered
                        </small>
                    </div>

                    {error && (
                        <div className="pin-login-error">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`pin-login-button ${!isFormValid ? 'disabled' : ''}`}
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner">
                                <span className="spinner"></span>
                                Signing In...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="pin-login-footer">
                    <p className="register-prompt">
                        <button
                            type="button"
                            className="link-button"
                            onClick={onSwitchToReset}
                            disabled={isLoading}
                            style={{ marginBottom: '10px', display: 'block', width: '100%', textAlign: 'center' }}
                        >
                            Forgot PIN?
                        </button>
                    </p>
                    <p className="register-prompt">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            className="link-button"
                            onClick={onSwitchToRegister}
                            disabled={isLoading}
                        >
                            Create Account
                        </button>
                    </p>
                </div>
            </div>

            <div className="pin-login-background">
                <div className="background-pattern"></div>
            </div>
        </div>
    );
}

export { PinLogin };
