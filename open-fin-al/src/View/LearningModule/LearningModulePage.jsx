// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React from "react";
import {
    useLocation
} from "react-router-dom";

import { SlideshowWindow } from "./Slideshow/SlideshowWindow";

export function LearningModulePage(props) {
    const location = useLocation();

    const currentPageIndex = location.state.currentPageIndex;
    const nextPageIndex = location.state.currentPageIndex + 1;

    return (
        <div className="page">
            <SlideshowWindow pages={location.state.pages} currentPageIndex={currentPageIndex}/>
        </div>
    );
}

export default LearningModulePage;
