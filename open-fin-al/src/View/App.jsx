// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, useEffect } from "react";
import React, { useState, createContext, useEffect, use } from "react";

// Imports for react pages and assets
import AppLoaded from "./App/Loaded";
import { AppPreparing } from "./App/Preparing";
import { DataContext } from "./App/DataContext";
import { AppSidecarPreparing } from "./App/SidecarPreparing";
import { AppConfiguring } from "./App/Configuring";
import { AuthContainer } from "./Auth/AuthContainer";
import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { InitializationInteractor } from "../Interactor/InitializationInteractor";
import { SidecarInitializationInteractor } from "../Interactor/SidecarInitializationInteractor";
import { registerAllComponents } from "../hoc/registerComponents";

const createInitialAppState = () => {
    const currentDate = new Date();

    return {
    const [loading, setLoading] = useState(true);
    const [sidecarLoading, setSidecarLoading] = useState(true);
    const [secureConnectionsValidated, setSecureConnectionsValidated] = useState(false);
    const [configured, setConfigured] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [preparationError, setPreparationError] = useState(null);
    const [sidecarPreparationError, setSidecarPreparationError] = useState(null);
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
    };
};

function App(props) {
    const [loading, setLoading] = useState(true);
    const [secureConnectionsValidated, setSecureConnectionsValidated] = useState(false);
    const [configured, setConfigured] = useState(false);
    // ## Recent change
    // Track whether setup still needs user-specific API/email configuration
    // so we can authenticate first and defer Settings until after login.
    const [needsConfiguration, setNeedsConfiguration] = useState(false);
    const [preparationError, setPreparationError] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authViewKey, setAuthViewKey] = useState(0);
    const [state, setState] = useState(createInitialAppState);

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
    }, []);

    useEffect(() => {
        registerAllComponents();
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
        setState(createInitialAppState());
        setUser(userData);
        setIsAuthenticated(true);
        setAuthViewKey(prev => prev + 1);
        
        // Save user session
        localStorage.setItem('openfinAL_user', JSON.stringify(userData));
        
        console.log('User authenticated successfully:', userData);
    };

    // Handle user logout
    const handleLogout = () => {
        setState(createInitialAppState());
        setUser(null);
        setIsAuthenticated(false);
        setAuthViewKey(prev => prev + 1);
        localStorage.removeItem('openfinAL_user');
        window.location.hash = '#/';
        console.log('User logged out');
    };

    const handleLoading = () => {
        setLoading(false);
    };

    const handleConfigured = async () => {
        // ## Recent change
        // Completing Settings should clear the post-login setup gate.
        setConfigured(true);
        setNeedsConfiguration(false);
        await checkIfFullyInitialized(); 
    };

    const executeDataInitialization = async() => {
        try {
            setStatusMessage("Checking if system data is initialized...");
            const interactor = new InitializationInteractor();
            const requestObj = new JSONRequest(`{}`);
            const response = await interactor.post(requestObj,"initializeData"); 

            let slideshowBundleReponse; 

            if(response.response.ok) {
                setLoading(false);
                return true;
            } else {
                setStatusMessage("Retreiving data resources for system use...");
                //tables may have been deleted and need to be recreated
                const configurationResponse = await interactor.post(requestObj,"createConfig");
                window.console.log(configurationResponse);
                if(configurationResponse.response.ok) {
                    return await executeDataInitialization();
                } else {
                    throw new Error();
                }
            }
        } catch(error) {
            window.console.log(error);
            setPreparationError("Failed to initilize the software. Please contact the software administrator.");
            setLoading(true);
            return false;
        }
    };

    const checkIfFullyInitialized = async () => {
        try {
            setStatusMessage("Checking if the system is ready to start...");
            //determine if application is fully configured and data initialized
            const interactor = new InitializationInteractor();
            const requestObj = new JSONRequest(`{}`);
            const response = await interactor.get(requestObj,"isInitialized");
            
            if(response.response.ok) {
                // ## Recent change
                // Fully initialized means the normal app shell can load
                // without forcing the user through Settings.
                setConfigured(true);
                setNeedsConfiguration(false);

                if(secureConnectionsValidated) {
                    checkAuthenticationState();
                } else {
                    setStatusMessage("Updating security certificates...");
                    const interactor = new InitializationInteractor();
                    const requestObj = new JSONRequest(`{}`);
                    const response = await interactor.post(requestObj,"refreshPinnedCertificates");
                    setSecureConnectionsValidated(true);
                }

                setStatusMessage("Verifying learning modules are bundled...");
                const slideshowBundleReponse = await interactor.post(requestObj,"bundelSlideshows");

                if(slideshowBundleReponse.response.ok) {
                    setLoading(false);
                } else {
                    throw new Error("The slideshow bundle did not configure properly");
                }

                return true;
            } else {
                //check if the site is uninitialized but configured
                setStatusMessage("Checking if the system is configured...");
                const configurationResponse = await interactor.get(requestObj,"isConfigured");

                if(configurationResponse.response.ok) {
                    // ## Recent change
                    // Config is complete, so proceed with data initialization.
                    setConfigured(true);
                    setNeedsConfiguration(false);
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
                    // ## Recent change
                    // Create the base config and let the user authenticate first.
                    // The authenticated shell will redirect them to Settings.
                    setStatusMessage("Creating initial configuration...");
                    await interactor.post(requestObj,"createConfig");
                    setConfigured(true);
                    setNeedsConfiguration(true);
                    setLoading(false);
                    checkAuthenticationState();
                    return false;
                }
            }
        } catch(error) {
            setConfigured(false);
            setLoading(true);
            return false;
        }
    };

    const loadSidecar = async () => {
        try {
            const interactor = new SidecarInitializationInteractor();
            const requestObj = new JSONRequest(`{}`);
            const response = await interactor.post(requestObj,"loadSidecar");
            
            setStatusMessage("Starting the graph database...");

            if(response.response.ok) {
                const loadedResponse = await interactor.get(requestObj,"isLoaded");
                if(loadedResponse.response.ok) {
                    setStatusMessage("Graph database started. Checking if knowledge graph is set up...");
                    const graphExistsResponse = await interactor.get(requestObj,"isGraphInitialized");
                    
                    if(graphExistsResponse.response.ok) {
                        setStatusMessage("Knowledge graph is set up. Checking if system is fully initialized...");
                        setSidecarLoading(false);
                        await checkIfFullyInitialized();
                        return true;    
                    } else {
                        setStatusMessage("Graph database started. Initializing knowledge graph...");
                        const graphInitializedResponse = await interactor.post(requestObj,"initializeGraph");
                        
                        if(graphInitializedResponse.response.ok) {
                            setSidecarLoading(false);
                            await checkIfFullyInitialized();
                            return true;
                        } else {
                            throw new Error();
                        }
                    }
                } else {
                    throw new Error();
                }
            } else {
                throw new Error();
            }
        } catch(error) {
            setSidecarPreparationError("Failed to initilize the software database. Please contact the software administrator.");
            window.console.log(error);
            return false;
        }
    };

    useEffect( () => {
        loadSidecar();
    }, []);

    return (
        configured ?
            (
                loading ?
                    <AppPreparing handleLoading={handleLoading} preparationError={preparationError}/>
                :
                    (
                        !isAuthenticated ?
                            <AuthContainer key={`auth-${authViewKey}`} onAuthSuccess={handleAuthSuccess}/>
                        :
                            <DataContext.Provider value={value}>
                                {/* ## Recent change
                                    Pass the deferred-setup flag into the shell so
                                    signed-in users land in Settings when required. */}
                                <AppLoaded 
                                    key={`app-${authViewKey}`}
                                    needsConfiguration={needsConfiguration}
                                    checkIfConfigured={checkIfFullyInitialized} 
                                    handleConfigured={handleConfigured}
                                    onLogout={handleLogout}
                                />
                            </DataContext.Provider>
                    )                        
            )        
        :
            <AppPreparing handleLoading={handleLoading} preparationError={preparationError}/>
        sidecarLoading ?
            <AppSidecarPreparing handleLoading={setSidecarLoading} statusMessage={statusMessage} sidecarPreparationError={sidecarPreparationError}/>
        :
            configured ?
                ( loading ?
                        <AppPreparing handleLoading={handleLoading} statusMessage={statusMessage} preparationError={preparationError}/>
                    :
                        ( !isAuthenticated ?
                                <AuthContainer onAuthSuccess={handleAuthSuccess}/>
                            :
                                <DataContext.Provider value={value}>
                                    <AppLoaded 
                                        checkIfConfigured={checkIfFullyInitialized} 
                                        handleConfigured={handleConfigured}
                                        onLogout={handleLogout}
                                    />
                                </DataContext.Provider>
                        )                        
                )        
            : 
                <AppConfiguring checkIfConfigured={checkIfFullyInitialized} handleConfigured={handleConfigured}/>
    );
}

export { App };
