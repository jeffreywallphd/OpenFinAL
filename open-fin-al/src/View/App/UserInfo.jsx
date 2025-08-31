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
    const bubbleRef = useRef(null);

    if (!user) {
        return null;
    }

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            onLogout();
        }
        setBubbleOpen(false);
    };

    const toggleBubble = () => {
        setBubbleOpen(!bubbleOpen);
    };

    // Close bubble when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bubbleRef.current && !bubbleRef.current.contains(event.target)) {
                setBubbleOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="user-bubble-container" ref={bubbleRef}>
            <div className="user-avatar-bubble" onClick={toggleBubble}>
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
                    <button 
                        className="bubble-menu-item" 
                        onClick={handleLogout}
                    >
                        <span className="material-icons">logout</span>
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export { UserInfo };
