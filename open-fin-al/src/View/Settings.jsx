import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { SettingsInteractor } from "../Interactor/SettingsInteractor";
import { JSONRequest } from "../Gateway/Request/JSONRequest";
import { withViewComponent } from "../hoc/withViewComponent";
import { ViewComponent } from "../types/ViewComponent";
import { SettingsRow } from "./Settings/Row";
import { InitializationInteractor } from "../Interactor/InitializationInteractor";
import { useHeader } from "./App/LoadedLayout";
import { DataContext } from "./App/DataContext";

const WrappedSettingsRow = withViewComponent(SettingsRow);

function Settings(props) {
    const { setHeader } = useHeader();
    const { user } = useContext(DataContext);

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

    const fetchSettingSections = async () => {
        const settingSectionRequest = new JSONRequest(JSON.stringify({}));
        try {
            const response = await interactor.get(settingSectionRequest);
            setSections(response);
        } catch (error) {
            console.error("Failed to fetch setting sections:", error);
        }
    };

    const fetchCurrentSettings = async () => {
        const settingRequest = new JSONRequest(JSON.stringify({action: "getCurrent"}));
        try {
            const response = await interactor.get(settingRequest);
            const currentSettings = response.response.results[0];

            if (user) {
                currentSettings.FirstName = {
                    ...currentSettings.FirstName,
                    value: user.firstName ?? ""
                };
                currentSettings.LastName = {
                    ...currentSettings.LastName,
                    value: user.lastName ?? ""
                };
                currentSettings.Username = {
                    ...currentSettings.Username,
                    value: user.username ?? ""
                };
                if (currentSettings.Email) {
                    currentSettings.Email = {
                        ...currentSettings.Email,
                        value: user.email ?? ""
                    };
                }
            }

            setSettings(currentSettings);
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

    useEffect(() => {
        if (!user) {
            return;
        }

        setSettings((prev) => ({
            ...prev,
            ...(prev.FirstName ? {
                FirstName: {
                    ...prev.FirstName,
                    value: user.firstName ?? ""
                }
            } : {}),
            ...(prev.LastName ? {
                LastName: {
                    ...prev.LastName,
                    value: user.lastName ?? ""
                }
            } : {}),
            ...(prev.Username ? {
                Username: {
                    ...prev.Username,
                    value: user.username ?? ""
                }
            } : {}),
            ...(prev.Email ? {
                Email: {
                    ...prev.Email,
                    value: user.email ?? ""
                }
            } : {})
        }));
    }, [user]);

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

            props.checkIfConfigured();

            setTimeout(() => {
                navigate('/refresh', { replace: true });
                setTimeout(() => {
                    navigate(location.pathname, { replace: true });
                }, 100);
            }, 500);
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
                <div className="settings-card">
                    <div className="style-options">
                        <button
                            id="dark-mode-toggle"
                            onClick={() => {
                                toggleDarkMode();

                                setTimeout(() => {
                                    navigate('/refresh', { replace: true });
                                    setTimeout(() => {
                                        navigate(location.pathname, { replace: true });
                                    }, 10);
                                }, 50);
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
