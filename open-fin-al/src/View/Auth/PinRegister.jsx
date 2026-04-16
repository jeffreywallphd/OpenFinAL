// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState } from 'react';
import { UserAuthInteractor } from '../../Interactor/UserAuthInteractor';
import { PinEncryption } from '../../Utility/PinEncryption';

function PinRegister({ onRegistrationSuccess, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        pin: '',
        confirmPin: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);

    // Initialize auth interactor
    const authInteractor = new UserAuthInteractor();

    const handleInputChange = (field, value) => {
        if (field === 'pin' || field === 'confirmPin') {
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

    const validateForm = () => {
        const { firstName, lastName, username, pin, confirmPin } = formData;
        
        if (!firstName.trim()) return 'First name is required';
        if (!lastName.trim()) return 'Last name is required';
        if (!username.trim()) return 'Username is required';
        if (username.length < 3) return 'Username must be at least 3 characters';
        if (!PinEncryption.validatePinFormat(pin)) return 'PIN must be exactly 8 digits';
        if (pin !== confirmPin) return 'PINs do not match';
        
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            console.log('Starting registration process...');
            console.log('Form data:', {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                username: formData.username.trim(),
                pin: '****' // Don't log actual PIN
            });

            const result = await authInteractor.registerUser({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                username: formData.username.trim(),
                pin: formData.pin
            });

            console.log('Registration result:', result);

            if (result.success) {
                onRegistrationSuccess({
                    id: result.userId,
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    username: formData.username.trim()
                });
            } else {
                console.error('Registration failed:', result.error);
                setError(result.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(`Registration failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const generateRandomPin = () => {
        const randomPin = PinEncryption.generateRandomPin();
        setFormData(prev => ({
            ...prev,
            pin: randomPin,
            confirmPin: randomPin
        }));
    };

    const isFormValid = validateForm() === null;
    const pinMatch = formData.pin && formData.confirmPin && formData.pin === formData.confirmPin;

    return (
        <div className="pin-login-container">
            <div className="pin-login-card">
                <div className="pin-login-header">
                    <h1 className="pin-login-title">Create Account</h1>
                    <p className="pin-login-subtitle">Join OpenFinAL to start your financial journey</p>
                </div>

                <form onSubmit={handleSubmit} className="pin-login-form">
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
                            placeholder="Choose a unique username"
                            disabled={isLoading}
                            autoComplete="username"
                        />
                        {formData.username && formData.username.length < 3 && (
                            <small className="pin-help-text" style={{ color: '#dc2626' }}>
                                Username must be at least 3 characters
                            </small>
                        )}
                    </div>

                    <div className="pin-login-field">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label htmlFor="pin" className="pin-login-label">
                                8-Digit PIN
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
                                id="pin"
                                type={showPin ? "text" : "password"}
                                value={formData.pin}
                                onChange={(e) => handleInputChange('pin', e.target.value)}
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
                                style={{ width: `${(formData.pin.length / 8) * 100}%` }}
                            ></div>
                        </div>
                        <small className="pin-help-text">
                            {formData.pin.length}/8 digits entered
                        </small>
                    </div>

                    <div className="pin-login-field">
                        <label htmlFor="confirmPin" className="pin-login-label">
                            Confirm PIN
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
                        className={`pin-login-button ${!isFormValid ? 'disabled' : ''}`}
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner">
                                <span className="spinner"></span>
                                Creating Account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="pin-login-footer">
                    <p className="register-prompt">
                        Already have an account?{' '}
                        <button
                            type="button"
                            className="link-button"
                            onClick={onSwitchToLogin}
                            disabled={isLoading}
                        >
                            Sign In
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

export { PinRegister };
