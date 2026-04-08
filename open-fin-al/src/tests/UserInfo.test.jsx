import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../View/App/DataContext', () => {
    const React = require('react');
    return {
        DataContext: React.createContext({ user: null })
    };
});

import { UserInfo } from '../View/App/UserInfo';
import { DataContext } from '../View/App/DataContext';

// Mock the DataContext
const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe'
};

const renderUserInfo = (user = mockUser, onLogout = jest.fn()) => {
    return render(
        <DataContext.Provider value={{ user }}>
            <UserInfo onLogout={onLogout} />
        </DataContext.Provider>
    );
};

describe('UserInfo', () => {
    const mockOnLogout = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render user avatar bubble', () => {
        renderUserInfo();

        const avatar = screen.getByRole('button');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveClass('user-avatar-bubble');
        expect(screen.getByText('account_circle')).toBeInTheDocument();
    });

    test('should not render when user is null', () => {
        const { container } = renderUserInfo(null);
        expect(container.firstChild).toBeNull();
    });

    test('should unmount cleanly when user becomes null after logout', () => {
        const { rerender, container } = render(
            <DataContext.Provider value={{ user: mockUser }}>
                <UserInfo onLogout={mockOnLogout} />
            </DataContext.Provider>
        );

        rerender(
            <DataContext.Provider value={{ user: null }}>
                <UserInfo onLogout={mockOnLogout} />
            </DataContext.Provider>
        );

        expect(container.firstChild).toBeNull();
    });

    test('should show bubble menu when avatar is clicked', () => {
        renderUserInfo();

        const avatar = screen.getByRole('button');
        fireEvent.click(avatar);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('@johndoe')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    test('should hide bubble menu when avatar is clicked again', () => {
        renderUserInfo();

        const avatar = screen.getByRole('button');
        
        // Open menu
        fireEvent.click(avatar);
        expect(screen.getByText('John Doe')).toBeInTheDocument();

        // Close menu
        fireEvent.click(avatar);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    test('should close bubble menu when clicking outside', async () => {
        renderUserInfo();

        const avatar = screen.getByRole('button');
        fireEvent.click(avatar);

        expect(screen.getByText('John Doe')).toBeInTheDocument();

        // Click outside
        fireEvent.mouseDown(document.body);

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        });
    });

    test('should show logout confirmation before logging out', () => {
        renderUserInfo(mockUser, mockOnLogout);

        const avatar = screen.getByRole('button');
        fireEvent.click(avatar);

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        expect(screen.getByText('Log out of OpenFinAL?')).toBeInTheDocument();
        expect(screen.getByText('Yes, Log Out')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(mockOnLogout).not.toHaveBeenCalled();
    });

    test('should handle confirmed logout', () => {
        renderUserInfo(mockUser, mockOnLogout);

        const avatar = screen.getByRole('button');
        fireEvent.click(avatar);

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);
        fireEvent.click(screen.getByText('Yes, Log Out'));

        expect(mockOnLogout).toHaveBeenCalled();
    });

    test('should cancel logout confirmation', () => {
        renderUserInfo(mockUser, mockOnLogout);

        const avatar = screen.getByRole('button');
        fireEvent.click(avatar);

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);
        fireEvent.click(screen.getByText('Cancel'));

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(mockOnLogout).not.toHaveBeenCalled();
    });

    test('should display correct user information', () => {
        const customUser = {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            username: 'janesmith'
        };

        renderUserInfo(customUser);

        const avatar = screen.getByRole('button');
        fireEvent.click(avatar);

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('@janesmith')).toBeInTheDocument();
    });

    test('should have proper ARIA attributes', () => {
        renderUserInfo();

        const avatar = screen.getByRole('button');
        expect(avatar).toBeInTheDocument();
    });

    test('should handle user with long names', () => {
        const userWithLongName = {
            id: 3,
            firstName: 'VeryLongFirstName',
            lastName: 'VeryLongLastName',
            username: 'verylongusername'
        };

        renderUserInfo(userWithLongName);

        const avatar = screen.getByRole('button');
        fireEvent.click(avatar);

        expect(screen.getByText('VeryLongFirstName VeryLongLastName')).toBeInTheDocument();
        expect(screen.getByText('@verylongusername')).toBeInTheDocument();
    });

    test('should handle special characters in user data', () => {
        const userWithSpecialChars = {
            id: 4,
            firstName: "John's",
            lastName: 'O"Connor',
            username: 'john.oconnor'
        };

        renderUserInfo(userWithSpecialChars);

        const avatar = screen.getByRole('button');
        fireEvent.click(avatar);

        expect(screen.getByText('John\'s O"Connor')).toBeInTheDocument();
        expect(screen.getByText('@john.oconnor')).toBeInTheDocument();
    });

    test('should maintain bubble state correctly', () => {
        renderUserInfo();

        const avatar = screen.getByRole('button');

        // Open and close multiple times
        fireEvent.click(avatar);
        expect(screen.getByText('John Doe')).toBeInTheDocument();

        fireEvent.click(avatar);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();

        fireEvent.click(avatar);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('should not interfere with other click events', () => {
        const mockExternalClick = jest.fn();
        
        const { container } = render(
            <div>
                <button onClick={mockExternalClick}>External Button</button>
                <DataContext.Provider value={{ user: mockUser }}>
                    <UserInfo onLogout={mockOnLogout} />
                </DataContext.Provider>
            </div>
        );

        const externalButton = screen.getByText('External Button');
        fireEvent.click(externalButton);

        expect(mockExternalClick).toHaveBeenCalled();
    });
});
