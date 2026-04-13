// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useMemo } from "react";
import {
    useLocation
} from "react-router-dom";

import { PowerPointComponent } from "../Component/Learn/PowerPointComponent";
import { ViewComponent } from "../../types/ViewComponent";

export function LearningModulePage(props) {
    const location = useLocation();

    const fileName = location.state.fileName;
    window.console.log(location.state);

    const pptxConfig = useMemo(() => new ViewComponent({
        height: 450, width: 800, isContainer: false, resizable: true,
        maintainAspectRatio: true, widthRatio: 16, heightRatio: 9,
        heightWidthRatioMultiplier: 0, visible: true, enabled: true,
        label: "PowerPoint Viewer", description: "Displays a PowerPoint slideshow",
        tags: ["learn", "slideshow", "powerpoint"], minimumProficiencyRequirements: {}, requiresInternet: false,
    }), []);

    return (
        <div className="page">
             <PowerPointComponent pptxPath={fileName} viewConfig={pptxConfig}/>
        </div>
    );
}

export default LearningModulePage;
