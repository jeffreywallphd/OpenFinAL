// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useEffect } from "react";

//Imports for react pages and assets
import logo from "../../Asset/Image/logo-dark.png";

export function AppPreparing(props) {
    return (
        <div className="loadingContainer">
            <div className="loadingContent">
                <div><img src={logo} alt="Logo" width="150" /></div>
                <div className="loadingText">
                    {props.preparationError ? (
                        <p className="error">{props.preparationError}</p>
                    ) : (
                        <>
                            <p>Downloading data resources...</p>
                            <p>This may take a few minutes</p>
                            <div className="loader"></div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
