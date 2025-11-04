// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React from "react";
import { FaSearch } from "react-icons/fa";

export function ModuleSearchBar({ searchRef, onSearch, onKeyUp, isSearching }) {
    return (
        <div className="module-search-container">
            <div className="module-search-wrapper">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    ref={searchRef}
                    className="module-search-input"
                    placeholder="Search a topic to learn about"
                    onKeyUp={onKeyUp}
                />
            </div>
        </div>
    );
}
