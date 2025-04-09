import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import ConfigUpdater from "../Utility/ConfigManager";
import { useNavigate, useLocation } from 'react-router-dom';
import { SettingsInteractor } from "../Interactor/SettingsInteractor";
import { JSONRequest } from "../Gateway/Request/JSONRequest";

function Settings(props) {
    const [sections, setSections] = useState([]);
    const [settings, setSettings] = useState({});
    const [message, setMessage] = useState(null);
    
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

    useEffect(() => {
        fetchSettingSections();
    }, []);

    useEffect(() => {
        fetchCurrentSettings();
    }, []);

    const getOption = (configuration, value) => {
        return configuration.options.find((option) => option.value === value);
    };

    const setOptionKey = (configurationName, key) => {
        setSettings(prev => ({
            ...prev,
            [configurationName]: {
                ...prev[configurationName],
                key: key
            }
        }));
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleSubmit = async (event) => {
        const request = new JSONRequest(JSON.stringify({
            configurations: settings
        }));
      
        var response = await interactor.post(request);

        if(response.response.status == 200) {
            setMessage("Successfully saved the configuration");
            await sleep(2000);
            setMessage(null);
        } else {
            setMessage("Failed to save the configuration");
        }
    };

    const configRefs = useRef({});
    const configKeyRefs = useRef({});

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true"; // Retrieve from localStorage
    });
    
    // Dynamically apply dark mode class to the body and store preference
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
        localStorage.setItem("darkMode", darkMode); // Store preference
    }, [darkMode]);
    
    useEffect(() => {
        const clearDarkMode = () => {
            //localStorage.removeItem("darkMode");
            localStorage.setItem("darkMode","false");
        };
    
        window.addEventListener("beforeunload", clearDarkMode);
        
        return () => {
            window.removeEventListener("beforeunload", clearDarkMode);
        };
    }, []);    

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className={`page ${props.initialConfiguration ? 'only' : ''}`}>
            <h2 className="settings-title"><span className="material-icons">settings</span> Settings</h2>
            
            {sections.response && sections.response.results.length > 0 && sections.response.results.map((section) => (
                <div className="settings-card">
                    <h3 className="card-title">{section.label}</h3>
                    <div className="api-config-table">
                        <div className="table-header">
                            <div className="header-cell">Select an API:</div>
                            <div className="header-cell">API Keys</div>
                        </div>
                        {section.configurations.map((configuration) => (
                            <div className="table-row">
                                <div className="api-cell">
                                    <select 
                                        id={configuration.name} 
                                        name={configuration.name} 
                                        ref={(el) => {
                                            if (el) {
                                                //dynamically generate refs to grant access to each select element
                                                //configRefs.current[`${section.id}-${configuration.id}`] = el;
                                                configRefs.current[configuration.name] = el;
                                            }
                                        }} 
                                        onChange={(e) => {
                                            setSettings(prev => ({
                                                ...prev,
                                                [configuration.name]: getOption(configuration, e.target.value)
                                            }));
                                        }}
                                        className="api-select" 
                                        value={settings[configuration.name] ? settings[configuration.name].value : ''} 
                                    >
                                        {configuration.options.map((option) => (
                                            <option key={option.value} value={option.value}>{option.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="key-cell">
                                    <input 
                                        type="text" 
                                        id="stockApiKey" 
                                        name="stockApiKey" 
                                        className="api-key-input" 
                                        ref={(el) => {
                                            if (el) {
                                                //dynamically generate refs to grant access to each input element
                                                //configKeyRefs.current[`${section.id}-${configuration.id}`] = el;
                                                configKeyRefs.current[configuration.name] = el;
                                            }
                                        }} 
                                        value={settings[configuration.name] && settings[configuration.name].hasKey ? settings[configuration.name].key : ''} 
                                        onChange={e => {
                                            setOptionKey(configuration.name, e.target.value);
                                        }}
                                        disabled={!settings[configuration.name].hasKey}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="save-button-container">
                        <button onClick={handleSubmit} className="save-button">Save Configuration</button>
                        {message && <p className="message">{message}</p>}
                    </div>
                </div>
            ))}

            {/* Application Style Card */}
            <div className="settings-card">
                <h3 className="card-title">Application Style Changes</h3>
                <div className="style-options">
                    <button
                    id="dark-mode-toggle"
                    onClick={() => {
                        const newDarkMode = !darkMode;
                        setDarkMode(newDarkMode);
                
                        // Force refresh of the route after state change
                        setTimeout(() => {
                            navigate('/refresh', { replace: true }); // dummy path
                            setTimeout(() => {
                                navigate(location.pathname, { replace: true }); // go back
                            }, 10);
                        }, 50); // slight delay to allow localStorage update
                    }}
                    style={{
                        padding: "10px 20px",
                        marginTop: "20px",
                        background: darkMode ? "#4A5568" : "#00a0b0",
                        color: darkMode ? "#E2E8F0" : "#fcfdff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                    >
                        {darkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                </div>
            </div>                       
        </div>
    );
}
export { Settings };
