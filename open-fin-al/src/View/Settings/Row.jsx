import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { JSONRequest } from "../../Gateway/Request/JSONRequest";

function SettingsRow(props) {
    const [sections, setSections] = useState([]);
    const [settings, setSettings] = useState({});
    const [message, setMessage] = useState(null);
    
    const getOption = (configuration, value) => {
        return configuration.options.find((option) => option.value === value);
    };

    const setOptionKey = (configurationName, key) => {
        props.setSettings(prev => ({
            ...prev,
            [configurationName]: {
                ...prev[configurationName],
                key: key
            }
        }));
    };

    return (
        <div className="table-row">
            <div className="api-cell">
                <select 
                    id={props.configuration.name} 
                    name={props.configuration.name} 
                    onChange={(e) => {
                        var option = getOption(props.configuration, e.target.value);
                        props.setSettings(prev => ({
                            ...prev,
                            [props.configuration.name]: option
                        }));
                    }}
                    className="api-select" 
                    value={props.settings[props.configuration.name] ? props.settings[props.configuration.name].value : ''} 
                >
                    {props.configuration.options.map((option) => (
                        <option key={option.value} value={option.value}>{option.name}</option>
                    ))}
                </select>
                { props.configuration.purpose && (
                        <>
                            <br/>
                            <span className="configDescription">{props.configuration.purpose}</span>
                        </>
                    ) 
                }
            </div>
            <div className="key-cell">
                <input 
                    type="text" 
                    id={props.configuration.name + "Key"} 
                    name={props.configuration.name + "Key"} 
                    className="api-key-input" 
                    value={props.settings[props.configuration.name] && props.settings[props.configuration.name].hasKey ? props.settings[props.configuration.name].key : ''} 
                    onChange={e => {
                        setOptionKey(props.configuration.name, e.target.value);
                        props.setSharedKeys(props.settings[props.configuration.name].keyName, e.target.value);
                    }}
                    disabled={!props.settings[props.configuration.name].hasKey}
                />
                { props.settings[props.configuration.name].hasKey ? (
                    <>
                        <br/>
                        <span className="configDescription">To obtain a key to retrieve data, please visit: <span className="spanLink" onClick={() => window.urlWindow.openUrlWindow(props.settings[props.configuration.name].keySite)}>{props.settings[props.configuration.name].keySite}</span></span>
                    </>
                ) : (
                    <>
                        <br/>
                        <span className="configDescription">A key is not required to retrieve data from this API</span>
                    </>
                )
                    
                }
            </div>
        </div>
    );
}
export { SettingsRow };
