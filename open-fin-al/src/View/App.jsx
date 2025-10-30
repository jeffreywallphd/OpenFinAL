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
import { AuthContainer } from "./Auth/AuthContainer";
import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { InitializationInteractor } from "../Interactor/InitializationInteractor";

const DataContext = createContext();

function App(props) {
    const currentDate = new Date();
    const [loading, setLoading] = useState(true);
    const [secureConnectionsValidated, setSecureConnectionsValidated] = useState(false);
    const [configured, setConfigured] = useState(false);
    const [preparationError, setPreparationError] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [state, setState] = useState({ 
        initializing: true,
        isFirstLoad: true,
        data: null,
        dataSource: null,
        secData: null,
        secSource: null,
        newsData: null,
        newsSource: null,
        comparisonData: {},
        chartData: null,
        error: null,
        ticker: null,
        cik: null,
        type: 'intraday',
        interval: '1D',
        securitiesList: null,
        searchRef: null,
        assetId: null,
        isLoading: false,
        minPrice: 0,
        maxPrice: 10,
        maxVolume: 1000,
        yAxisStart: new Date(currentDate.getDate() - 5).toISOString().split('T')[0],
        yAxisEnd: new Date().toISOString().split('T')[0]
    });

    const value = { state, setState, user, setUser, isAuthenticated, setIsAuthenticated };

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
        checkAuthenticationState();
    }, []);

    // Check if user is already authenticated from previous session
    const checkAuthenticationState = () => {
        try {
            const savedUser = localStorage.getItem('openfinAL_user');
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);
                console.log('User session restored:', userData);
            }
        } catch (error) {
            console.error('Error restoring user session:', error);
            localStorage.removeItem('openfinAL_user');
        }
    };

    // Handle successful authentication
    const handleAuthSuccess = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        
        // Save user session
        localStorage.setItem('openfinAL_user', JSON.stringify(userData));
        
        console.log('User authenticated successfully:', userData);
    };

    // Handle user logout
    const handleLogout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('openfinAL_user');
        console.log('User logged out');
    };

    const handleLoading = () => {
        setLoading(false);
    };

    const handleConfigured = async () => {
        setConfigured(true);
        await checkIfFullyInitialized(); 
    };

    const executeDataInitialization = async() => {
        try {
            const interactor = new InitializationInteractor();
            const requestObj = new JSONRequest(`{}`);
            const response = await interactor.post(requestObj,"initializeData");

            if(response.response.ok) {
                setLoading(false);
                return true;
            } else {
                //tables may have been deleted and need to be recreated
                const configurationResponse = await interactor.post(requestObj,"createConfig");
                
                if(configurationResponse.response.ok) {
                    return await executeDataInitialization();
                } else {
                    throw new Error();
                }
            }
        } catch(error) {
            setPreparationError("Failed to initilize the software. Please contact the software administrator.");
            setLoading(true);
            return false;
        }
    };

    const checkIfFullyInitialized = async () => {
        try {
            //determine if application is fully configured and data initialized
            const interactor = new InitializationInteractor();
            const requestObj = new JSONRequest(`{}`);
            const response = await interactor.get(requestObj,"isInitialized");
            
            if(response.response.ok) {
                setConfigured(true);

                if(secureConnectionsValidated) {
                    setLoading(false);
                } else {
                    const interactor = new InitializationInteractor();
                    const requestObj = new JSONRequest(`{}`);
                    const response = await interactor.post(requestObj,"refreshPinnedCertificates");
                    setSecureConnectionsValidated(true);
                    setLoading(false);
                }

                return true;
            } else {
                //check if the site is uninitialized but configured
                const configurationResponse = await interactor.get(requestObj,"isConfigured");

                if(configurationResponse.response.ok) {
                    setConfigured(true);
                    getDarkMode();

                    //app is not initialized, so start data initialization
                    const initialized = await executeDataInitialization();

                    if(initialized) {
                        setLoading(false);
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    await interactor.post(requestObj,"createConfig");
                    setConfigured(false);
                    setLoading(true);
                    return false;
                }
            }
        } catch(error) {
            setConfigured(false);
            setLoading(true);
            return false;
        }
    };

    useEffect( () => {
        checkIfFullyInitialized();
    }, []);

    // If not authenticated, show authentication interface
    if (!isAuthenticated) {
        return <AuthContainer onAuthSuccess={handleAuthSuccess} />;
    }

    return (
        configured ?
            (
                loading ?
                        <AppPreparing handleLoading={handleLoading} preparationError={preparationError}/>
                    :
                        <DataContext.Provider value={value}>
                            <AppLoaded 
                                checkIfConfigured={checkIfFullyInitialized} 
                                handleConfigured={handleConfigured}
                                onLogout={handleLogout}
                            />
                        </DataContext.Provider>            
            )        
        : 
            <AppConfiguring checkIfConfigured={checkIfFullyInitialized} handleConfigured={handleConfigured}/>
    );
}

export { App, DataContext };
