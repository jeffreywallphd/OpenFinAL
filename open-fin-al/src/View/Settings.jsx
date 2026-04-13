import React, { useRef, useEffect, useState, useLayoutEffect, useMemo } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { SettingsInteractor } from "../Interactor/SettingsInteractor";
import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { withViewComponent } from "../hoc/withViewComponent";
import { ViewComponent } from "../types/ViewComponent";
import { SettingsRow } from "./Settings/Row";

const WrappedSettingsRow = withViewComponent(SettingsRow);
import { InitializationInteractor } from "../Interactor/InitializationInteractor";
import { useHeader } from "./App/LoadedLayout";

function Settings(props) {
    const { setHeader } = useHeader();
          
    useEffect(() => {
        setHeader({
        title: "Settings",
        icon: "settings", 
        });
    }, [setHeader]);

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
        var configured = props.checkIfConfigured();

        if(!configured) {
            const initInteractor = new InitializationInteractor();
            const requestObj = new JSONRequest(`{}`);
            const response = await initInteractor.post(requestObj,"createConfig");

            if(response.response.ok) {
                const settingsRequestObj = new JSONRequest(JSON.stringify({action: "isConfigured"}));
                const settingsResponse = await interactor.get(settingsRequestObj);

                if(settingsResponse.response.ok) {
                    props.handleConfigured();
                }
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

            const isConfigured = props.checkIfConfigured();

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

    const settingsRowConfig = useMemo(() => new ViewComponent({
        height: 48, width: 600, isContainer: false, resizable: true,
        maintainAspectRatio: false, widthRatio: 1, heightRatio: 1,
        heightWidthRatioMultiplier: 0, visible: true, enabled: true,
        label: "Settings Row", description: "A single row in the settings panel",
        tags: ["settings", "row", "configuration"], minimumProficiencyRequirements: {}, requiresInternet: false,
    }), []);

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className={`page ${props.initialConfiguration ? 'only' : ''}`}>
            <header>
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
                                {darkMode ? "Light Mode" : "Dark Mode"}
                        </button>
                    </div>
                </div>
            </header>
            {sections.response && sections.response.results.length > 0 && sections.response.results.map((section) => (
                <div key={section.label} className="settings-card">
                    <h3 className="card-title">{section.label}</h3>
                    <div className="api-config-table">
                        <div className="table-header">
                            <div className="header-cell">Setting</div>
                            <div className="header-cell">Value</div>
                        </div>
                        {section.configurations.map((configuration) => (
                            <WrappedSettingsRow key={configuration.valueName ?? configuration.label} settings={settings} setSettings={setSettings} configuration={configuration} setSharedValues={setSharedValues} viewConfig={settingsRowConfig}/>
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
