import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../View/App/DataContext', () => {
    const React = require('react');
    return {
        DataContext: React.createContext({ user: null })
    };
});

import { Settings } from '../View/Settings';
import { DataContext } from '../View/App/DataContext';

const mockGet = jest.fn();

jest.mock('../View/App/LoadedLayout', () => ({
    useHeader: () => ({
        setHeader: jest.fn()
    })
}));

jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/settings' })
}));

jest.mock('../Interactor/SettingsInteractor', () => ({
    SettingsInteractor: jest.fn().mockImplementation(() => ({
        get: (...args) => mockGet(...args),
        post: jest.fn()
    }))
}));

jest.mock('../Interactor/InitializationInteractor', () => ({
    InitializationInteractor: jest.fn().mockImplementation(() => ({
        post: jest.fn().mockResolvedValue({ response: { ok: true } })
    }))
}));

describe('Settings user profile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.config = {
            load: jest.fn().mockResolvedValue({ DarkMode: false })
        };

        mockGet.mockImplementation(async (request) => {
            if (request?.request?.action === 'getCurrent') {
                return {
                    response: {
                        results: [
                            {
                                FirstName: { name: 'FirstName', label: 'First Name', hasValue: true, value: 'First User', valueName: 'FirstName' },
                                LastName: { name: 'LastName', label: 'Last Name', hasValue: true, value: 'FromDb', valueName: 'LastName' },
                                Username: { name: 'Username', label: 'Username', hasValue: true, value: 'firstuser', valueName: 'Username', isLocked: true },
                                Email: { name: 'Email', label: 'Email', hasValue: true, value: 'first@example.com', valueName: 'Email' }
                            }
                        ]
                    }
                };
            }

            return {
                response: {
                    results: [
                        {
                            label: 'User Profile',
                            configurations: [
                                { name: 'FirstName', type: 'text', options: [{ label: 'First Name' }] },
                                { name: 'LastName', type: 'text', options: [{ label: 'Last Name' }] },
                                { name: 'Username', type: 'text', options: [{ label: 'Username' }] },
                                { name: 'Email', type: 'text', options: [{ label: 'Email' }] }
                            ]
                        }
                    ]
                }
            };
        });
    });

    test('shows the authenticated user in the user profile section', async () => {
        render(
            <DataContext.Provider value={{ user: { id: 2, firstName: 'Current', lastName: 'User', username: 'currentuser' } }}>
                <Settings initialConfiguration={false} checkIfConfigured={() => true} handleConfigured={jest.fn()} />
            </DataContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Current')).toBeInTheDocument();
        });

        expect(screen.getByDisplayValue('User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('currentuser')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('First User')).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue('firstuser')).not.toBeInTheDocument();
    });

    test('shows the authenticated email in the user profile section', async () => {
        render(
            <DataContext.Provider value={{ user: { id: 2, firstName: 'Current', lastName: 'User', email: 'current@example.com', username: 'currentuser' } }}>
                <Settings initialConfiguration={false} checkIfConfigured={() => true} handleConfigured={jest.fn()} />
            </DataContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Current')).toBeInTheDocument();
        });

        expect(screen.getByDisplayValue('current@example.com')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('first@example.com')).not.toBeInTheDocument();
    });

    test('renders safely without a data context provider', async () => {
        render(
            <Settings initialConfiguration={true} checkIfConfigured={() => true} handleConfigured={jest.fn()} />
        );

        await waitFor(() => {
            expect(screen.getByText('User Profile')).toBeInTheDocument();
        });

        expect(screen.getByDisplayValue('First User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('firstuser')).toBeInTheDocument();
    });
});
