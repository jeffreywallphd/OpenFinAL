import React from "react";
import { SettingsRowLabel } from "./RowLabel";
import { SettingsRowValue } from "./RowValue";

function SettingsRow(props) {   
    return (
        <div className="table-row">
            <SettingsRowLabel settings={props.settings} setSettings={props.setSettings} configuration={props.configuration} />
            <SettingsRowValue settings={props.settings} setSettings={props.setSettings} configuration={props.configuration} setSharedKeys={props.setSharedKeys} />
        </div>
    );
}
export { SettingsRow };
