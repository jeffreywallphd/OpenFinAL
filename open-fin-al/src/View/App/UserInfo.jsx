// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useContext, useState, useRef, useEffect } from 'react';
import { DataContext } from '../App';

function UserInfo({ onLogout }) {
    const { user } = useContext(DataContext);
    const [bubbleOpen, setBubbleOpen] = useState(false);
    const [confirmingLogout, setConfirmingLogout] = useState(false);
    const bubbleRef = useRef(null);

    const requestLogoutConfirmation = () => {
        setConfirmingLogout(true);
    };

    const handleLogout = () => {
        setConfirmingLogout(false);
        setBubbleOpen(false);
        onLogout();
    };

    const cancelLogout = () => {
        setConfirmingLogout(false);
        setBubbleOpen(false);
    };

    const toggleBubble = () => {
        setBubbleOpen(!bubbleOpen);
        if (bubbleOpen) {
            setConfirmingLogout(false);
        }
    };

    // Close bubble when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bubbleRef.current && !bubbleRef.current.contains(event.target)) {
                setBubbleOpen(false);
                setConfirmingLogout(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!user) {
        return null;
    }

    return (
        <div className="user-bubble-container" ref={bubbleRef}>
            <div className="user-avatar-bubble" onClick={toggleBubble} role="button" tabIndex="0">
                <span className="material-icons">account_circle</span>
            </div>
            
            {bubbleOpen && (
                <div className="user-menu-bubble">
                    <div className="bubble-header">
                        <div className="user-name">
                            {user.firstName} {user.lastName}
                        </div>
                        <div className="user-username">
                            @{user.username}
                        </div>
                    </div>
                    <div className="bubble-divider"></div>
                    {confirmingLogout ? (
                        <div className="bubble-confirmation">
                            <p className="bubble-confirmation-text">Log out of OpenFinAL?</p>
                            <div className="bubble-confirmation-actions">
                                <button 
                                    className="bubble-menu-item bubble-confirm-button"
                                    onClick={handleLogout}
                                >
                                    <span className="material-icons">check</span>
                                    <span>Yes, Log Out</span>
                                </button>
                                <button 
                                    className="bubble-menu-item bubble-cancel-button"
                                    onClick={cancelLogout}
                                >
                                    <span className="material-icons">close</span>
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            className="bubble-menu-item" 
                            onClick={requestLogoutConfirmation}
                        >
                            <span className="material-icons">logout</span>
                            <span>Logout</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export { UserInfo };
