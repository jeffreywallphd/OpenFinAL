// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, createContext, useEffect } from "react";

// Imports for react pages and assets
import AppLoaded from "./AppLoaded";
import { AppPreparing } from "./AppPreparing";

const DataContext = createContext();

function App(props) {
    const currentDate = new Date();
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState({ 
        initializing: true,
        isFirstLoad: true,
        data: null,
        dataSource: null,
        secData: null,
        secSource: null,
        error: null,
        ticker: null,
        cik: null,
        type: 'intraday',
        interval: '1D',
        securitiesList: null,
        searchRef: null,
        isLoading: false,
        minPrice: 0,
        maxPrice: 10,
        maxVolume: 1000,
        yAxisStart: new Date(currentDate.getDate() - 5).toISOString().split('T')[0],
        yAxisEnd: new Date().toISOString().split('T')[0]
    });

    const value = { state, setState };

    // Clear localStorage when the app is closed or refreshed
    useEffect(() => {
        const clearDarkMode = () => {
            localStorage.removeItem("darkMode");
        };

        window.addEventListener("beforeunload", clearDarkMode);
        return () => {
            window.removeEventListener("beforeunload", clearDarkMode);
        };
    }, []);

    const handleLoading = () => {
        setLoading(false);
    };

    return (
        loading ? 
            <AppPreparing handleLoading={handleLoading}/> 
        : 
            <DataContext.Provider value={value}>
                <AppLoaded />
            </DataContext.Provider>
    );
}

export { App, DataContext };
