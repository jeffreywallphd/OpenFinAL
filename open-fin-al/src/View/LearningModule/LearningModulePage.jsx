// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React from "react";
import {
    useLocation
} from "react-router-dom";

import { PowerPoint } from "./Slideshow/PowerPoint";

export function LearningModulePage(props) {
    const location = useLocation();

    const fileName = location.state.fileName;
    window.console.log(location.state);
    return ( 
        <div className="page">
             <PowerPoint pptxPath={fileName}/>
        </div>
    );
}

export default LearningModulePage;
