// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState } from 'react';
import { PinLogin } from './PinLogin';
import { PinRegister } from './PinRegister';
import { PinReset } from './PinReset';

function AuthContainer({ onAuthSuccess }) {
    const [authMode, setAuthMode] = useState('login'); // 'login', 'register', or 'reset'

    const handleLoginSuccess = (user) => {
        console.log('Login successful:', user);
        onAuthSuccess(user);
    };

    const handleRegistrationSuccess = (user) => {
        console.log('Registration successful:', user);
        // After successful registration, automatically log them in
        onAuthSuccess(user);
    };

    const handleResetSuccess = (user) => {
        console.log('PIN reset successful:', user);
        onAuthSuccess(user);
    };

    const switchToRegister = () => {
        setAuthMode('register');
    };

    const switchToLogin = () => {
        setAuthMode('login');
    };

    const switchToReset = () => {
        setAuthMode('reset');
    };

    return (
        <>
            {authMode === 'login' ? (
                <PinLogin
                    onLoginSuccess={handleLoginSuccess}
                    onSwitchToRegister={switchToRegister}
                    onSwitchToReset={switchToReset}
                />
            ) : authMode === 'register' ? (
                <PinRegister
                    onRegistrationSuccess={handleRegistrationSuccess}
                    onSwitchToLogin={switchToLogin}
                />
            ) : (
                <PinReset
                    onResetSuccess={handleResetSuccess}
                    onSwitchToLogin={switchToLogin}
                />
            )}
        </>
    );
}

export { AuthContainer };
