import React from "react";


function SettingsRowLabel(props) {   
    const getOption = (configuration, name) => {
        return configuration.options.find((option) => option.name === name);
    };

    return (   
        <div className="api-cell">
            {props.configuration.type !== "select" ?
                <p>{props.configuration.options[0].label}:</p>
            :
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
                    value={props.settings[props.configuration.name] ? props.settings[props.configuration.name].name : ''} 
                >
                    {props.configuration.options.map((option) => (
                        <option key={option.name} value={option.name}>{option.label}</option>
                    ))}
                </select>
            }
            { props.configuration.purpose && (
                    <>
                        <span className="configDescription">{props.configuration.purpose}</span>
                    </>
                ) 
            }
        </div>      
    );
}
export { SettingsRowLabel };
