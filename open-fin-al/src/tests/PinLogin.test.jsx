import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PinLogin } from '../View/Auth/PinLogin';
import { UserAuthInteractor } from '../Interactor/UserAuthInteractor';

// Mock UserAuthInteractor
jest.mock('../Interactor/UserAuthInteractor');
const mockUserAuthInteractor = UserAuthInteractor;

describe('PinLogin', () => {
    const mockOnLoginSuccess = jest.fn();
    const mockOnSwitchToRegister = jest.fn();
    const mockOnSwitchToReset = jest.fn();
    const mockLoginUser = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserAuthInteractor.mockImplementation(() => ({
            loginUser: mockLoginUser,
        }));
    });

    const renderPinLogin = () => {
        return render(
            <PinLogin
                onLoginSuccess={mockOnLoginSuccess}
                onSwitchToRegister={mockOnSwitchToRegister}
                onSwitchToReset={mockOnSwitchToReset}
            />
        );
    };

    test('should render login form with all elements', () => {
        renderPinLogin();

        expect(screen.getByText('OpenFinAL')).toBeInTheDocument();
        expect(screen.getByText('Financial Analysis & Learning Platform')).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('8-Digit PIN')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
        expect(screen.getByText('Forgot PIN?')).toBeInTheDocument();
        expect(screen.getByText('Create Account')).toBeInTheDocument();
    });

    test('should update username input', () => {
        renderPinLogin();
        const usernameInput = screen.getByLabelText('Username');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });

        expect(usernameInput).toHaveValue('testuser');
    });

    test('should update PIN input and show progress', () => {
        renderPinLogin();
        const pinInput = screen.getByLabelText('8-Digit PIN');

        fireEvent.change(pinInput, { target: { value: '12345678' } });

        expect(pinInput).toHaveValue('12345678');
        expect(screen.getByText('8/8 digits entered')).toBeInTheDocument();
    });

    test('should only allow digits in PIN input', () => {
        renderPinLogin();
        const pinInput = screen.getByLabelText('8-Digit PIN');

        fireEvent.change(pinInput, { target: { value: '123abc45' } });

        expect(pinInput).toHaveValue('12345');
    });

    test('should limit PIN input to 8 digits', () => {
        renderPinLogin();
        const pinInput = screen.getByLabelText('8-Digit PIN');

        fireEvent.change(pinInput, { target: { value: '123456789' } });

        expect(pinInput).toHaveValue('');

        fireEvent.change(pinInput, { target: { value: '12345678' } });
        expect(pinInput).toHaveValue('12345678');
    });

    test('should toggle PIN visibility', () => {
        renderPinLogin();
        const pinInput = screen.getByLabelText('8-Digit PIN');
        const toggleButton = screen.getByLabelText('Show PIN');

        expect(pinInput).toHaveAttribute('type', 'password');

        fireEvent.click(toggleButton);
        expect(pinInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(pinInput).toHaveAttribute('type', 'password');
    });

    test('should disable submit button when form is invalid', () => {
        renderPinLogin();
        const submitButton = screen.getByRole('button', { name: 'Sign In' });

        expect(submitButton).toBeDisabled();

        // Add username but incomplete PIN
        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('8-Digit PIN'), { target: { value: '1234567' } });

        expect(submitButton).toBeDisabled();
    });

    test('should enable submit button when form is valid', () => {
        renderPinLogin();
        const submitButton = screen.getByRole('button', { name: 'Sign In' });

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('8-Digit PIN'), { target: { value: '12345678' } });

        expect(submitButton).not.toBeDisabled();
    });

    test('should handle successful login', async () => {
        mockLoginUser.mockResolvedValue({
            success: true,
            user: { id: 1, username: 'testuser', firstName: 'Test', lastName: 'User' }
        });

        renderPinLogin();

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('8-Digit PIN'), { target: { value: '12345678' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        await waitFor(() => {
            expect(mockLoginUser).toHaveBeenCalledWith('testuser', '12345678');
            expect(mockOnLoginSuccess).toHaveBeenCalledWith({
                id: 1,
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User'
            });
        });
    });

    test('should handle login failure', async () => {
        mockLoginUser.mockResolvedValue({
            success: false,
            error: 'Invalid credentials'
        });

        renderPinLogin();

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('8-Digit PIN'), { target: { value: '12345678' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });

        expect(mockOnLoginSuccess).not.toHaveBeenCalled();
    });

    test('should handle login exception', async () => {
        mockLoginUser.mockRejectedValue(new Error('Network error'));

        renderPinLogin();

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('8-Digit PIN'), { target: { value: '12345678' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        await waitFor(() => {
            expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
        });
    });

    test('should show loading state during login', async () => {
        mockLoginUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        renderPinLogin();

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('8-Digit PIN'), { target: { value: '12345678' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        expect(screen.getByText('Signing In...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Signing In/i })).toBeDisabled();
    });

    test('should switch to register mode', () => {
        renderPinLogin();

        fireEvent.click(screen.getByText('Create Account'));

        expect(mockOnSwitchToRegister).toHaveBeenCalled();
    });

    test('should switch to reset mode', () => {
        renderPinLogin();

        fireEvent.click(screen.getByText('Forgot PIN?'));

        expect(mockOnSwitchToReset).toHaveBeenCalled();
    });

    test('should disable navigation buttons during loading', async () => {
        mockLoginUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        renderPinLogin();

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('8-Digit PIN'), { target: { value: '12345678' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

        expect(screen.getByText('Forgot PIN?')).toHaveAttribute('disabled');
        expect(screen.getByText('Create Account')).toHaveAttribute('disabled');
    });

    test('should update PIN progress indicator', () => {
        renderPinLogin();
        const pinInput = screen.getByLabelText('8-Digit PIN');

        // Test different PIN lengths
        fireEvent.change(pinInput, { target: { value: '123' } });
        expect(screen.getByText('3/8 digits entered')).toBeInTheDocument();

        fireEvent.change(pinInput, { target: { value: '12345' } });
        expect(screen.getByText('5/8 digits entered')).toBeInTheDocument();

        fireEvent.change(pinInput, { target: { value: '12345678' } });
        expect(screen.getByText('8/8 digits entered')).toBeInTheDocument();
    });

    test('should prevent form submission on Enter when invalid', () => {
        renderPinLogin();
        const form = document.querySelector('form');

        // Incomplete form
        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('8-Digit PIN'), { target: { value: '1234' } });

        // Try to submit with Enter
        fireEvent.keyDown(form, { key: 'Enter', code: 'Enter' });

        expect(mockLoginUser).not.toHaveBeenCalled();
    });
});
