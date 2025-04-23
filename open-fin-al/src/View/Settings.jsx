import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { SettingsInteractor } from "../Interactor/SettingsInteractor";
import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { SettingsRow } from "./Settings/Row";
import { InitializationInteractor } from "../Interactor/InitializationInteractor";

function Settings(props) {
    const [sections, setSections] = useState([]);
    const [settings, setSettings] = useState({});
    const [message, setMessage] = useState(null);
    const [darkMode, setDarkMode] = useState(() => {
        async function getInitialDarkMode() {
            const config = await window.config.load();
            return config.DarkMode;
        }
        getInitialDarkMode();
    });
    
    const interactor = new SettingsInteractor();

    // Function to get setting sections from interactor
    const fetchSettingSections = async () => {
        const settingSectionRequest = new JSONRequest(JSON.stringify({}));
        try {
            const response = await interactor.get(settingSectionRequest);
            setSections(response); // save to state or handle however needed
        } catch (error) {
            console.error("Failed to fetch setting sections:", error);
        }
    };

    // Function to get setting sections from interactor
    const fetchCurrentSettings = async () => {
        const settingRequest = new JSONRequest(JSON.stringify({action: "getCurrent"}));
        try {
            const response = await interactor.get(settingRequest);
            setSettings(response.response.results[0]); // save to state or handle however needed
        } catch (error) {
            console.error("Failed to fetch setting sections:", error);
        }
    };

    const prepareConfiguration = async () => {
        var configured = await props.checkIfConfigured();

        if(!configured) {
            const interactor = new InitializationInteractor();
            const requestObj = new JSONRequest(`{}`);
            const response = await interactor.post(requestObj,"createConfig");
            window.console.log(response);
            if(response.response.ok) {
                configured = true;
            }
        } else if(props.initialConfiguration && configured) {
            props.handleConfigured();
        }

        await fetchCurrentSettings();
        await fetchSettingSections();
    };

    useEffect(() => {
        prepareConfiguration();
    }, []);

    /*useEffect(() => {
        fetchSettingSections();
    }, []);

    useEffect(() => {
        fetchCurrentSettings();
    }, []);*/

    const setSharedValues = (valueName, value) => {
        for(var setting of Object.values(settings)) {
            if(setting.valueName === valueName) {
                setting.value = value;
            }
        }
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleSubmit = async (event) => {
        const request = new JSONRequest(JSON.stringify({
            configurations: settings
        }));
      
        var response = await interactor.post(request);

        if(response.response.status == 200) {
            setMessage("Successfully saved the configuration");
            await sleep(1000);
            setMessage(null);
            
            const isConfigured = await props.checkIfConfigured();
            window.console.log(`Is the site configured? ${isConfigured}`);

            setTimeout(() => {
                navigate('/refresh', { replace: true }); // dummy path
                setTimeout(() => {
                    navigate(location.pathname, { replace: true }); // go back
                }, 100);
            }, 500); // slight delay to allow config update
        } else {
            setMessage("Failed to save the configuration");
        }
    };

    const toggleDarkMode = async () => {
        const config = await window.config.load();
        config.DarkMode = !config.DarkMode;
        await window.config.save(config);

        setDarkMode(config.DarkMode);
    
        if (config.DarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    };

    useEffect(() => {
        async function getDarkMode() {
            const config = await window.config.load();
            if(config && config.DarkMode) {
                setDarkMode(true);
                document.body.classList.add("dark-mode");
            } else {
                setDarkMode(false);
                document.body.classList.remove("dark-mode");
            }
        }

        getDarkMode();
    }, []);    

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className={`page ${props.initialConfiguration ? 'only' : ''}`}>
            <header>
                <h2 className="settings-title"><span className="material-icons">settings</span> Settings</h2>
                {/* Application Style Card */}
                <div className="settings-card">
                    <div className="style-options">
                        <button
                            id="dark-mode-toggle"
                            onClick={() => {
                                toggleDarkMode();
                        
                                // Force refresh of the route after state change
                                setTimeout(() => {
                                    navigate('/refresh', { replace: true }); // dummy path
                                    setTimeout(() => {
                                        navigate(location.pathname, { replace: true }); // go back
                                    }, 10);
                                }, 50); // slight delay to allow config update
                            }}
                            >
                                {darkMode ? "Dark Mode" : "Light Mode"}
                        </button>
                    </div>
                </div>
            </header> 
            {sections.response && sections.response.results.length > 0 && sections.response.results.map((section) => (
                <div className="settings-card">
                    <h3 className="card-title">{section.label}</h3>
                    <div className="api-config-table">
                        <div className="table-header">
                            <div className="header-cell">Setting</div>
                            <div className="header-cell">Value</div>
                        </div>
                        {section.configurations.map((configuration) => (
                            <>
                                <SettingsRow settings={settings} setSettings={setSettings} configuration={configuration} setSharedValues={setSharedValues} />                                                                                   
                            </>
                        ))}
                    </div>
                    <div className="save-button-container">
                        <button onClick={handleSubmit} className="save-button">Save Configuration</button>
                        {message && <span className="message">{message}</span>}
                    </div>
                </div>
            ))}                      
        </div>
    );
}
export { Settings };
