import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../View/App';

jest.mock('../View/Auth/AuthContainer', () => ({
    AuthContainer: ({ onAuthSuccess }) => (
        <div data-testid="auth-container">
            <button
                type="button"
                onClick={() => onAuthSuccess({ id: 1, firstName: 'Test', lastName: 'User', username: 'tester' })}
            >
                Mock Login
            </button>
        </div>
    )
}));

jest.mock('../View/App/Loaded', () => {
    const React = require('react');

    return {
        __esModule: true,
        default: ({ onLogout }) => (
            <div data-testid="app-loaded">
                <button type="button" onClick={onLogout}>
                    Mock Logout
                </button>
            </div>
        )
    };
});

jest.mock('../View/App/Preparing', () => ({
    AppPreparing: () => <div data-testid="app-preparing">Preparing</div>
}));

jest.mock('../View/App/Configuring', () => ({
    AppConfiguring: () => <div data-testid="app-configuring">Configuring</div>
}));

jest.mock('../Interactor/InitializationInteractor', () => ({
    InitializationInteractor: jest.fn().mockImplementation(() => ({
        get: jest.fn().mockResolvedValue({ response: { ok: true } }),
        post: jest.fn().mockResolvedValue({ response: { ok: true } })
    }))
}));

describe('App auth flow', () => {
    beforeEach(() => {
        localStorage.clear();
        window.scrollTo = jest.fn();
        window.location.hash = '';
        window.config = {
            load: jest.fn().mockResolvedValue({ DarkMode: false })
        };
    });

    test('allows logging in again after logout', async () => {
        render(<App />);

        await waitFor(() => {
            expect(screen.getByTestId('auth-container')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Mock Login'));

        await waitFor(() => {
            expect(screen.getByTestId('app-loaded')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Mock Logout'));

        await waitFor(() => {
            expect(screen.getByTestId('auth-container')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Mock Login'));

        await waitFor(() => {
            expect(screen.getByTestId('app-loaded')).toBeInTheDocument();
        });
    });
});
