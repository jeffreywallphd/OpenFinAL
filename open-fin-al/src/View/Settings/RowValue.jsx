import React from "react";

function SettingsRowValue(props) {
    const setOptionValue = (configurationName, value) => {
        props.setSettings(prev => ({
            ...prev,
            [configurationName]: {
                ...prev[configurationName],
                value: value
            }
        }));
    };

    return (            
        <div className="key-cell">
            <input 
                type="text" 
                id={props.configuration.name + "Value"} 
                name={props.configuration.name + "Value"} 
                className="api-key-input" 
                value={props.settings[props.configuration.name] && props.settings[props.configuration.name].hasValue ? props.settings[props.configuration.name].value : ''} 
                onChange={e => {
                    setOptionValue(props.configuration.name, e.target.value);
                    props.setSharedValues(props.settings[props.configuration.name].valueName, e.target.value);
                }}
                disabled={!props.settings[props.configuration.name].hasValue}
            />
            { props.settings[props.configuration.name].hasValue && props.settings[props.configuration.name].valueSite ? (
                <>
                    <br/>
                    <span className="configDescription">To obtain a key to retrieve data, please visit: <span className="spanLink" onClick={() => window.urlWindow.openUrlWindow(props.settings[props.configuration.name].valueSite)}>{props.settings[props.configuration.name].valueSite}</span></span>
                </>
            ) : (
                !props.settings[props.configuration.name].hasValue  && (
                    <>
                        <br/>
                        <span className="configDescription">A value is not required for this setting.</span>
                    </>
                )
            )
                
            }
        </div>
    );
}
export { SettingsRowValue };
