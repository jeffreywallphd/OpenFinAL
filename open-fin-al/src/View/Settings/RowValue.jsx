import React from "react";


function SettingsRowValue(props) {
    const setOptionValue = (configurationName, key) => {
        props.setSettings(prev => ({
            ...prev,
            [configurationName]: {
                ...prev[configurationName],
                key: key
            }
        }));
    };

    return (            
        <div className="key-cell">
            <input 
                type="text" 
                id={props.configuration.name + "Key"} 
                name={props.configuration.name + "Key"} 
                className="api-key-input" 
                value={props.settings[props.configuration.name] && props.settings[props.configuration.name].hasKey ? props.settings[props.configuration.name].key : ''} 
                onChange={e => {
                    setOptionValue(props.configuration.name, e.target.value);
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
    );
}
export { SettingsRowValue };
