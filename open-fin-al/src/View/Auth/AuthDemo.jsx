// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, useEffect } from 'react';
import { AuthContainer } from './AuthContainer';
import { UserAuthInteractor } from '../../Interactor/UserAuthInteractor';

/**
 * Demo component showing how to integrate PIN authentication into the main app
 * This would typically be integrated into the main App.jsx component
 */
function AuthDemo() {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize auth service
    const authService = new UserAuthInteractor();

    // Check if user is already logged in (e.g., from localStorage or session)
    useEffect(() => {
        const savedUser = localStorage.getItem('openfinAL_user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('openfinAL_user');
            }
        }
    }, []);

    const handleAuthSuccess = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        
        // Save user session (in production, use secure session management)
        localStorage.setItem('openfinAL_user', JSON.stringify(userData));
        
        console.log('User authenticated successfully:', userData);
    };

    const handleLogout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('openfinAL_user');
        console.log('User logged out');
    };

    if (!isAuthenticated) {
        return <AuthContainer onAuthSuccess={handleAuthSuccess} />;
    }

    return (
        <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            backgroundColor: 'var(--background-color)',
            minHeight: '100vh',
            color: 'var(--text-color-dark)'
        }}>
            <h1 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>
                Welcome to OpenFinAL, {user.firstName}!
            </h1>
            
            <div style={{ 
                backgroundColor: 'var(--background-color-highlight-light)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                maxWidth: '600px',
                margin: '0 auto 20px auto'
            }}>
                <h3>User Information</h3>
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Username:</strong> {user.username}</p>
                {user.userId && <p><strong>User ID:</strong> {user.userId}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <p>🎉 Authentication successful! You can now access all OpenFinAL features.</p>
                <p>Your portfolio and learning progress will be automatically linked to your account.</p>
            </div>

            <button
                onClick={handleLogout}
                style={{
                    padding: '12px 24px',
                    backgroundColor: 'var(--secondary-color)',
                    color: 'var(--text-color-white)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'var(--primary-color)';
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'var(--secondary-color)';
                }}
            >
                Logout
            </button>

            <div style={{ 
                marginTop: '40px',
                padding: '20px',
                backgroundColor: 'var(--background-color-highlight-light)',
                borderRadius: '8px',
                maxWidth: '800px',
                margin: '40px auto 0 auto',
                textAlign: 'left'
            }}>
                <h3>Integration Notes for Developers:</h3>
                <ul style={{ lineHeight: '1.6' }}>
                    <li>Replace this demo component with your main application content</li>
                    <li>The authentication state is managed in the parent component</li>
                    <li>User data is automatically saved to localStorage for session persistence</li>
                    <li>Portfolio and learning module data will be linked via user.userId</li>
                    <li>Implement proper session management and security in production</li>
                    <li>Consider adding password reset and account management features</li>
                </ul>
            </div>
        </div>
    );
}

export { AuthDemo };
