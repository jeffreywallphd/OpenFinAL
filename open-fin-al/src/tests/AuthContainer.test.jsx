import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthContainer } from '../View/Auth/AuthContainer';

// Mock the child components
jest.mock('../View/Auth/PinLogin', () => ({
    PinLogin: ({ onLoginSuccess, onSwitchToRegister, onSwitchToReset }) => (
        <div data-testid="pin-login">
            <button onClick={() => onLoginSuccess({ id: 1, username: 'testuser' })}>
                Login Success
            </button>
            <button onClick={onSwitchToRegister}>Switch to Register</button>
            <button onClick={onSwitchToReset}>Switch to Reset</button>
        </div>
    )
}));

jest.mock('../View/Auth/PinRegister', () => ({
    PinRegister: ({ onRegistrationSuccess, onSwitchToLogin }) => (
        <div data-testid="pin-register">
            <button onClick={() => onRegistrationSuccess({ id: 1, username: 'newuser' })}>
                Registration Success
            </button>
            <button onClick={onSwitchToLogin}>Switch to Login</button>
        </div>
    )
}));

jest.mock('../View/Auth/PinReset', () => ({
    PinReset: ({ onResetSuccess, onSwitchToLogin }) => (
        <div data-testid="pin-reset">
            <button onClick={() => onResetSuccess({ id: 1, username: 'resetuser' })}>
                Reset Success
            </button>
            <button onClick={onSwitchToLogin}>Switch to Login</button>
        </div>
    )
}));

describe('AuthContainer', () => {
    const mockOnAuthSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render PinLogin component by default', () => {
        render(<AuthContainer onAuthSuccess={mockOnAuthSuccess} />);
        
        expect(screen.getByTestId('pin-login')).toBeInTheDocument();
        expect(screen.queryByTestId('pin-register')).not.toBeInTheDocument();
        expect(screen.queryByTestId('pin-reset')).not.toBeInTheDocument();
    });

    test('should switch to register mode when requested', () => {
        render(<AuthContainer onAuthSuccess={mockOnAuthSuccess} />);
        
        fireEvent.click(screen.getByText('Switch to Register'));
        
        expect(screen.getByTestId('pin-register')).toBeInTheDocument();
        expect(screen.queryByTestId('pin-login')).not.toBeInTheDocument();
        expect(screen.queryByTestId('pin-reset')).not.toBeInTheDocument();
    });

    test('should switch to reset mode when requested', () => {
        render(<AuthContainer onAuthSuccess={mockOnAuthSuccess} />);
        
        fireEvent.click(screen.getByText('Switch to Reset'));
        
        expect(screen.getByTestId('pin-reset')).toBeInTheDocument();
        expect(screen.queryByTestId('pin-login')).not.toBeInTheDocument();
        expect(screen.queryByTestId('pin-register')).not.toBeInTheDocument();
    });

    test('should switch back to login from register', () => {
        render(<AuthContainer onAuthSuccess={mockOnAuthSuccess} />);
        
        // Switch to register
        fireEvent.click(screen.getByText('Switch to Register'));
        expect(screen.getByTestId('pin-register')).toBeInTheDocument();
        
        // Switch back to login
        fireEvent.click(screen.getByText('Switch to Login'));
        expect(screen.getByTestId('pin-login')).toBeInTheDocument();
        expect(screen.queryByTestId('pin-register')).not.toBeInTheDocument();
    });

    test('should switch back to login from reset', () => {
        render(<AuthContainer onAuthSuccess={mockOnAuthSuccess} />);
        
        // Switch to reset
        fireEvent.click(screen.getByText('Switch to Reset'));
        expect(screen.getByTestId('pin-reset')).toBeInTheDocument();
        
        // Switch back to login
        fireEvent.click(screen.getByText('Switch to Login'));
        expect(screen.getByTestId('pin-login')).toBeInTheDocument();
        expect(screen.queryByTestId('pin-reset')).not.toBeInTheDocument();
    });

    test('should handle login success', () => {
        render(<AuthContainer onAuthSuccess={mockOnAuthSuccess} />);
        
        fireEvent.click(screen.getByText('Login Success'));
        
        expect(mockOnAuthSuccess).toHaveBeenCalledWith({ id: 1, username: 'testuser' });
    });

    test('should handle registration success', () => {
        render(<AuthContainer onAuthSuccess={mockOnAuthSuccess} />);
        
        // Switch to register
        fireEvent.click(screen.getByText('Switch to Register'));
        
        // Trigger registration success
        fireEvent.click(screen.getByText('Registration Success'));
        
        expect(mockOnAuthSuccess).toHaveBeenCalledWith({ id: 1, username: 'newuser' });
    });

    test('should handle reset success', () => {
        render(<AuthContainer onAuthSuccess={mockOnAuthSuccess} />);
        
        // Switch to reset
        fireEvent.click(screen.getByText('Switch to Reset'));
        
        // Trigger reset success
        fireEvent.click(screen.getByText('Reset Success'));
        
        expect(mockOnAuthSuccess).toHaveBeenCalledWith({ id: 1, username: 'resetuser' });
    });

    test('should maintain state correctly during mode switches', () => {
        render(<AuthContainer onAuthSuccess={mockOnAuthSuccess} />);
        
        // Start with login
        expect(screen.getByTestId('pin-login')).toBeInTheDocument();
        
        // Switch to register
        fireEvent.click(screen.getByText('Switch to Register'));
        expect(screen.getByTestId('pin-register')).toBeInTheDocument();
        
        // Switch to login from register
        fireEvent.click(screen.getByText('Switch to Login'));
        expect(screen.getByTestId('pin-login')).toBeInTheDocument();
        
        // Switch to reset
        fireEvent.click(screen.getByText('Switch to Reset'));
        expect(screen.getByTestId('pin-reset')).toBeInTheDocument();
        
        // Switch back to login from reset
        fireEvent.click(screen.getByText('Switch to Login'));
        expect(screen.getByTestId('pin-login')).toBeInTheDocument();
    });
});
