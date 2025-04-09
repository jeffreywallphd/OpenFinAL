import React from "react";


function SettingsRowLabel(props) {   
    const getOption = (configuration, value) => {
        return configuration.options.find((option) => option.value === value);
    };

    return (   
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
    );
}
export { SettingsRowLabel };
