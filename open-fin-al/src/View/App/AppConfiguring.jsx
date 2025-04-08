// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useEffect } from "react";
import {
    Routes,
    Route,
    HashRouter
  } from "react-router-dom";

//Imports for react pages and assets
import {Settings} from "../Settings";

export function AppConfiguring(props) {
    const checkConfig = async () => {
        props.handleConfigured();
    };

    useEffect(() => {
        checkConfig();
    }, []);

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Settings initialConfiguration={true} />} />
            </Routes>
        </HashRouter>        
    );
}
