// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, createContext, useEffect } from "react";

// Imports for react pages and assets
import AppLoaded from "./App/Loaded";
import { AppPreparing } from "./App/Preparing";
import { AppConfiguring } from "./App/Configuring";
import  ConfigUpdater  from "../Utility/ConfigManager";
import { SettingsInteractor } from "../Interactor/SettingsInteractor";
import { JSONRequest } from "../Gateway/Request/JSONRequest";

const DataContext = createContext();

function App(props) {
    const currentDate = new Date();
    const [loading, setLoading] = useState(true);
    const [configured, setConfigured] = useState(false);
    const [state, setState] = useState({ 
        initializing: true,
        isFirstLoad: true,
        data: null,
        dataSource: null,
        secData: null,
        secSource: null,
        comparisonData: {},
        chartData: null,
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

    // Establish dark mode settings when loaded or refreshed
    const getDarkMode = async () => {
        const config = await window.config.load();
        if(config && config.DarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    };

    useEffect( () => {
        getDarkMode();
    }, []);

    const handleLoading = () => {
        setLoading(false);
    };

    const handleConfigured = () => {
        setConfigured(true);
    };

    const checkIfConfigured = async () => { 
        const interactor = new SettingsInteractor();

        const request = new JSONRequest(JSON.stringify({
            action: "isConfigured"
        }));

        const response = await interactor.get(request);
        window.console.log(response);
        if(response.response.status === 200) {
            setConfigured(true);
            getDarkMode();
        } else {
            setConfigured(false);
        }

        return configured;
    };

    /*useEffect( () => {
        checkIfConfigured();
    }, [setLoading]);*/

    var config = null;

    /*useEffect(() => {
        try {
            configurator.createEnvIfNotExists();
            configurator.createConfigIfNotExists()
            config = configurator.getConfig();
        } catch(error) {
            console.log(error);
        } 
    }, []);*/

    return (
        configured ?
            (
                loading ?
                    <AppPreparing handleLoading={handleLoading}/>
                    
                    :

                    <DataContext.Provider value={value}>
                        <AppLoaded />
                    </DataContext.Provider>            
            )        
        : 
            <AppConfiguring checkIfConfigured={checkIfConfigured} config={config} handleConfigured={handleConfigured}/>
             
    );
}

export { App, DataContext };
