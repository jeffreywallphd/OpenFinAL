// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, useEffect } from "react";
import {
    NavLink,
    useLocation,
    useNavigate 
} from "react-router-dom";

export function LearningModuleDetails(props) {
    const location = useLocation();
    const navigate = useNavigate();

    const [state, setState] = useState({
        pages: null,
        isLoading: true
    });

    useEffect(() => {
        selectPageData();
    }, []);

    const selectPageData = async () => {
        try {            
            // TODO: move this query building to a Gateway implementation for SQLite
            // so that it can easily be configured with other databases later
            const inputData = [];
            var query = "SELECT * FROM LearningModulePage WHERE moduleId=? ORDER BY pageNumber ASC";
            
            inputData.push(location.state.moduleId);
            await window.database.SQLiteSelectData({ query, inputData }).then((data) => {
                setState({
                    pages: data,
                    isLoading: false
                  });
            });
        } catch (error) {
            console.error('Error fetching data:' + error);
        }
    };

    const handleStartModule = async () => {
        try {
            const filePath = await window.slideshow.getPath(location.state.fileName);
            window.console.log(filePath);
            // navigate to the learningModulePage route with the full path
            navigate("/learningModulePage", {
                state: {
                    fileName: filePath,
                    moduleId: location.state.moduleId
                },
            });
        } catch (err) {
            console.error("Error starting module:", err);
        }
    };

    return (
        <div className="page">
            <div>
                <h3>{location.state.title}</h3>
                <p>Description: {location.state.description}</p>
                <p>Estimated Time: {location.state.timeEstimate} minutes</p>
            </div>
                {
                    state.isLoading ? 
                    (<div>Loading...</div>) :
                    (
                        <div>
                            <button onClick={handleStartModule}>
                                Start Module
                            </button>
                        </div>
                    )
                }
        </div>
    );
}
