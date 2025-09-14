// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState } from 'react';
import { UserAuthInteractor } from '../../Interactor/UserAuthInteractor';
import { PinEncryption } from '../../Utility/PinEncryption';

function PinReset({ onResetSuccess, onSwitchToLogin }) {
    const [step, setStep] = useState(1); // 1: Identity verification, 2: New PIN setup
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        newPin: '',
        confirmPin: ''
    });
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);

    // Initialize auth interactor
    const authInteractor = new UserAuthInteractor();

    const handleInputChange = (field, value) => {
        if (field === 'newPin' || field === 'confirmPin') {
            // Only allow digits and limit to 8 characters
            value = value.replace(/\D/g, '').slice(0, 8);
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleIdentityVerification = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await authInteractor.initiatePinReset(
                formData.username.trim(),
                formData.firstName.trim(),
                formData.lastName.trim()
            );
            
            if (result.success) {
                setUserId(result.userId);
                setStep(2);
            } else {
                setError(result.error || 'Identity verification failed');
            }
        } catch (error) {
            console.error('Identity verification error:', error);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePinReset = async (e) => {
        e.preventDefault();
        setError('');

        // Validate new PIN
        if (!PinEncryption.validatePinFormat(formData.newPin)) {
            setError('PIN must be exactly 8 digits');
            return;
        }

        if (formData.newPin !== formData.confirmPin) {
            setError('PINs do not match');
            return;
        }

        setIsLoading(true);

        try {
            const result = await authInteractor.completePinReset(userId, formData.newPin);
            
            if (result.success) {
                // Automatically log in the user after successful PIN reset
                const loginResult = await authInteractor.loginUser(formData.username, formData.newPin);
                if (loginResult.success) {
                    onResetSuccess(loginResult.user);
                } else {
                    // PIN was reset but login failed, redirect to login page
                    onSwitchToLogin();
                }
            } else {
                setError(result.error || 'PIN reset failed');
            }
        } catch (error) {
            console.error('PIN reset error:', error);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const generateRandomPin = () => {
        const randomPin = PinEncryption.generateRandomPin();
        setFormData(prev => ({
            ...prev,
            newPin: randomPin,
            confirmPin: randomPin
        }));
    };

    const isStep1Valid = formData.username.trim() && formData.firstName.trim() && formData.lastName.trim();
    const isStep2Valid = formData.newPin.length === 8 && formData.newPin === formData.confirmPin;
    const pinMatch = formData.newPin && formData.confirmPin && formData.newPin === formData.confirmPin;

    return (
        <div className="pin-login-container">
            <div className="pin-login-card">
                <div className="pin-login-header">
                    <h1 className="pin-login-title">Reset PIN</h1>
                    <p className="pin-login-subtitle">
                        {step === 1 ? 'Verify your identity to reset your PIN' : 'Create your new 8-digit PIN'}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleIdentityVerification} className="pin-login-form">
                        <div className="pin-login-field">
                            <label htmlFor="username" className="pin-login-label">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                className="pin-login-input"
                                placeholder="Enter your username"
                                disabled={isLoading}
                                autoComplete="username"
                            />
                        </div>

                        <div className="pin-login-field">
                            <label htmlFor="firstName" className="pin-login-label">
                                First Name
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                className="pin-login-input"
                                placeholder="Enter your first name"
                                disabled={isLoading}
                                autoComplete="given-name"
                            />
                        </div>

                        <div className="pin-login-field">
                            <label htmlFor="lastName" className="pin-login-label">
                                Last Name
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                className="pin-login-input"
                                placeholder="Enter your last name"
                                disabled={isLoading}
                                autoComplete="family-name"
                            />
                        </div>

                        {error && (
                            <div className="pin-login-error">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`pin-login-button ${!isStep1Valid ? 'disabled' : ''}`}
                            disabled={!isStep1Valid || isLoading}
                        >
                            {isLoading ? (
                                <span className="loading-spinner">
                                    <span className="spinner"></span>
                                    Verifying...
                                </span>
                            ) : (
                                'Verify Identity'
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handlePinReset} className="pin-login-form">
                        <div className="pin-login-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label htmlFor="newPin" className="pin-login-label">
                                    New 8-Digit PIN
                                </label>
                                <button
                                    type="button"
                                    className="link-button"
                                    onClick={generateRandomPin}
                                    disabled={isLoading}
                                    style={{ fontSize: '12px' }}
                                >
                                    Generate Random
                                </button>
                            </div>
                            <div className="pin-input-container">
                                <input
                                    id="newPin"
                                    type={showPin ? "text" : "password"}
                                    value={formData.newPin}
                                    onChange={(e) => handleInputChange('newPin', e.target.value)}
                                    className="pin-login-input pin-input"
                                    placeholder="••••••••"
                                    maxLength="8"
                                    disabled={isLoading}
                                    autoComplete="new-password"
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
                                    style={{ width: `${(formData.newPin.length / 8) * 100}%` }}
                                ></div>
                            </div>
                            <small className="pin-help-text">
                                {formData.newPin.length}/8 digits entered
                            </small>
                        </div>

                        <div className="pin-login-field">
                            <label htmlFor="confirmPin" className="pin-login-label">
                                Confirm New PIN
                            </label>
                            <div className="pin-input-container">
                                <input
                                    id="confirmPin"
                                    type={showConfirmPin ? "text" : "password"}
                                    value={formData.confirmPin}
                                    onChange={(e) => handleInputChange('confirmPin', e.target.value)}
                                    className="pin-login-input pin-input"
                                    placeholder="••••••••"
                                    maxLength="8"
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="pin-toggle-button"
                                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                                    disabled={isLoading}
                                    aria-label={showConfirmPin ? "Hide PIN" : "Show PIN"}
                                >
                                    {showConfirmPin ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                            {formData.confirmPin && (
                                <small 
                                    className="pin-help-text" 
                                    style={{ 
                                        color: pinMatch ? '#059669' : '#dc2626' 
                                    }}
                                >
                                    {pinMatch ? '✓ PINs match' : '✗ PINs do not match'}
                                </small>
                            )}
                        </div>

                        {error && (
                            <div className="pin-login-error">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`pin-login-button ${!isStep2Valid ? 'disabled' : ''}`}
                            disabled={!isStep2Valid || isLoading}
                        >
                            {isLoading ? (
                                <span className="loading-spinner">
                                    <span className="spinner"></span>
                                    Resetting PIN...
                                </span>
                            ) : (
                                'Reset PIN'
                            )}
                        </button>
                    </form>
                )}

                <div className="pin-login-footer">
                    <p className="register-prompt">
                        Remember your PIN?{' '}
                        <button
                            type="button"
                            className="link-button"
                            onClick={onSwitchToLogin}
                            disabled={isLoading}
                        >
                            Back to Sign In
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

export { PinReset };
