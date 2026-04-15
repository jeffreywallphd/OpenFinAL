// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, useEffect } from "react";
import AppLoaded from "./App/Loaded";
import { AppPreparing } from "./App/Preparing";
import { AppSidecarPreparing } from "./App/SidecarPreparing";
import { DataContext } from "./App/DataContext";
import { AuthContainer } from "./Auth/AuthContainer";
import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { InitializationInteractor } from "../Interactor/InitializationInteractor";
import { SidecarInitializationInteractor } from "../Interactor/SidecarInitializationInteractor";
import { registerAllComponents } from "../hoc/registerComponents";

const createInitialAppState = () => {
    const currentDate = new Date();

    return {
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
        type: "intraday",
        interval: "1D",
        securitiesList: null,
        searchRef: null,
        assetId: null,
        isLoading: false,
        minPrice: 0,
        maxPrice: 10,
        maxVolume: 1000,
        yAxisStart: new Date(currentDate.getDate() - 5).toISOString().split("T")[0],
        yAxisEnd: new Date().toISOString().split("T")[0]
    };
};

function App(props) {
    const [loading, setLoading] = useState(true);
    const [sidecarLoading, setSidecarLoading] = useState(true);
    const [secureConnectionsValidated, setSecureConnectionsValidated] = useState(false);
    const [configured, setConfigured] = useState(false);
    const [needsConfiguration, setNeedsConfiguration] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [preparationError, setPreparationError] = useState(null);
    const [sidecarPreparationError, setSidecarPreparationError] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authViewKey, setAuthViewKey] = useState(0);
    const [state, setState] = useState(createInitialAppState);

    const value = { state, setState, user, setUser, isAuthenticated, setIsAuthenticated };

    const getDarkMode = async () => {
        const config = await window.config.load();
        if(config && config.DarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    };

    useEffect(() => {
        getDarkMode();
    }, []);

    useEffect(() => {
        registerAllComponents();
    }, []);

    const checkAuthenticationState = () => {
        try {
            const savedUser = localStorage.getItem("openfinAL_user");
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);
                console.log("User session restored:", userData);
            }
        } catch (error) {
            console.error("Error restoring user session:", error);
            localStorage.removeItem("openfinAL_user");
        }
    };

    const handleAuthSuccess = (userData) => {
        setState(createInitialAppState());
        setUser(userData);
        setIsAuthenticated(true);
        setAuthViewKey((prev) => prev + 1);
        localStorage.setItem("openfinAL_user", JSON.stringify(userData));
        console.log("User authenticated successfully:", userData);
    };

    const handleLogout = () => {
        setState(createInitialAppState());
        setUser(null);
        setIsAuthenticated(false);
        setAuthViewKey((prev) => prev + 1);
        localStorage.removeItem("openfinAL_user");
        window.location.hash = "#/";
        console.log("User logged out");
    };

    const handleLoading = () => {
        setLoading(false);
    };

    const handleConfigured = async () => {
        setConfigured(true);
        setNeedsConfiguration(false);
        await checkIfFullyInitialized();
    };

    const executeDataInitialization = async () => {
        try {
            setStatusMessage("Checking if system data is initialized...");
            const interactor = new InitializationInteractor();
            const requestObj = new JSONRequest(`{}`);
            const response = await interactor.post(requestObj, "initializeData");

            if (response.response.ok) {
                setLoading(false);
                return true;
            }

            setStatusMessage("Retreiving data resources for system use...");
            const configurationResponse = await interactor.post(requestObj, "createConfig");
            window.console.log(configurationResponse);
            if (configurationResponse.response.ok) {
                return await executeDataInitialization();
            }
            throw new Error();
        } catch (error) {
            window.console.log(error);
            setPreparationError("Failed to initilize the software. Please contact the software administrator.");
            setLoading(true);
            return false;
        }
    };

    const checkIfFullyInitialized = async () => {
        try {
            setStatusMessage("Checking if the system is ready to start...");
            const interactor = new InitializationInteractor();
            const requestObj = new JSONRequest(`{}`);
            const response = await interactor.get(requestObj, "isInitialized");

            if (response.response.ok) {
                setConfigured(true);
                setNeedsConfiguration(false);

                if (secureConnectionsValidated) {
                    checkAuthenticationState();
                } else {
                    setStatusMessage("Updating security certificates...");
                    await interactor.post(requestObj, "refreshPinnedCertificates");
                    setSecureConnectionsValidated(true);
                }

                setStatusMessage("Verifying learning modules are bundled...");
                const slideshowBundleResponse = await interactor.post(requestObj, "bundelSlideshows");

                if (slideshowBundleResponse.response.ok) {
                    setLoading(false);
                } else {
                    throw new Error("The slideshow bundle did not configure properly");
                }

                return true;
            }

            setStatusMessage("Checking if the system is configured...");
            const configurationResponse = await interactor.get(requestObj, "isConfigured");

            if (configurationResponse.response.ok) {
                setConfigured(true);
                setNeedsConfiguration(false);
                getDarkMode();

                const initialized = await executeDataInitialization();
                if (initialized) {
                    setLoading(false);
                    return true;
                }
                return false;
            }

            setStatusMessage("Creating initial configuration...");
            await interactor.post(requestObj, "createConfig");
            setConfigured(true);
            setNeedsConfiguration(true);
            setLoading(false);
            checkAuthenticationState();
            return false;
        } catch (error) {
            setConfigured(false);
            setLoading(true);
            return false;
        }
    };

    const loadSidecar = async () => {
        try {
            const interactor = new SidecarInitializationInteractor();
            const requestObj = new JSONRequest(`{}`);
            const response = await interactor.post(requestObj, "loadSidecar");

            setStatusMessage("Starting the graph database...");

            if (!response.response.ok) {
                throw new Error();
            }

            const loadedResponse = await interactor.get(requestObj, "isLoaded");
            if (!loadedResponse.response.ok) {
                throw new Error();
            }

            setStatusMessage("Graph database started. Checking if knowledge graph is set up...");
            const graphExistsResponse = await interactor.get(requestObj, "isGraphInitialized");

            if (!graphExistsResponse.response.ok) {
                setStatusMessage("Graph database started. Initializing knowledge graph...");
                const graphInitializedResponse = await interactor.post(requestObj, "initializeGraph");
                if (!graphInitializedResponse.response.ok) {
                    throw new Error();
                }
            }

            setStatusMessage("Knowledge graph is set up. Checking if system is fully initialized...");
            setSidecarLoading(false);
            await checkIfFullyInitialized();
            return true;
        } catch (error) {
            setSidecarPreparationError("Failed to initilize the software database. Please contact the software administrator.");
            window.console.log(error);
            return false;
        }
    };

    useEffect(() => {
        loadSidecar();
    }, []);

    return (
        sidecarLoading ?
            <AppSidecarPreparing handleLoading={setSidecarLoading} statusMessage={statusMessage} sidecarPreparationError={sidecarPreparationError}/>
        :
            configured ?
                (
                    loading ?
                        <AppPreparing handleLoading={handleLoading} statusMessage={statusMessage} preparationError={preparationError}/>
                    :
                        (
                            !isAuthenticated ?
                                <AuthContainer key={`auth-${authViewKey}`} onAuthSuccess={handleAuthSuccess}/>
                            :
                                <DataContext.Provider value={value}>
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
                <AppPreparing handleLoading={handleLoading} statusMessage={statusMessage} preparationError={preparationError}/>
    );
}

export { App };
