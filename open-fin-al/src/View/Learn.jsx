// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { RecommendedModuleCard } from "./LearningModule/components/RecommendedModuleCard";
import { ModuleCard } from "./LearningModule/components/ModuleCard";
import { ModuleSearchBar } from "./LearningModule/components/ModuleSearchBar";
import "./LearningModule/LearningModules.css";

export function Learn() {
    const location = useLocation();
    const [state, setState] = useState({
        modules: null,
        isLoading: true,
        searching: false,
        recommendedModule: null,
        moduleProgress: {} // Mock progress data, replace with real data from backend
    });
    const searchRef = useRef("SearchTextField");

    useEffect(() => {
        selectData();
            // === New Block for Recommendation ===
        async function fetchRecommendation() {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/recommendation?userId=1&k=1");
                const data = await res.json();
                if (data.ok && data.items && data.items.length > 0) {
                    const module = data.items[0].module;
                    alert(`Recommended Module:\n${module.title}`);
                } else {
                    console.log("No recommendation available.");
                }
            } catch (err) {
                console.error("Error fetching recommendation:", err);
            }
        }

        fetchRecommendation();
    }, []);

    //Checks the keyUp event to determine if a key was hit
    const checkInput = async (e) => {
        //fetch data when Enter key pressed
        if (e.key === "Enter"){
            await selectData();
        } 
    }    

    const selectData = async () => {
        try {
            setState(prevState => ({
                ...prevState,
                searching: true
            }));
            
            // TODO: move this query building to a Gateway implementation for SQLite
            // so that it can easily be configured with other databases later
            const inputData = [];
            var query = "SELECT * FROM LearningModule"

            // TODO: use more sophisticated NLP query, such as: https://www.sqlite.org/fts5.html
            if(searchRef.current && searchRef.current.value !== "") {
                query += " WHERE keywords LIKE '%' || ? || '%' OR title LIKE '%' || ? || '%'";
                inputData.push(searchRef.current.value);
                inputData.push(searchRef.current.value);
            }

            query += " ORDER BY dateCreated DESC, title ASC"
            
            query += " LIMIT ?"
            const limit = 25;
            inputData.push(limit);
            
            await window.database.SQLiteSelectData({ query, inputData }).then((data) => {
                // Mock progress data - replace with real data from backend
                const mockProgress = {
                    1: 20,  // Introduction to Stocks - 20% complete
                    2: 60,  // Introduction to Bonds - 60% complete
                    3: 35,  // Basics of Blockchain - 35% complete
                    4: 80,  // Risk-Free Investments - 80% complete
                    5: 5,   // ETF Fundamentals - 5% complete
                    6: 0    // Intro to Options - 0% complete
                };
                
                // Set recommended module (e.g., first module in the list or based on user activity)
                const recommended = data && data.length > 0 ? data[0] : null;
                
                setState({
                    modules: data,
                    isLoading: false,
                    searching: false,
                    recommendedModule: recommended,
                    moduleProgress: mockProgress
                });
            });
        } catch (error) {
            console.error('Error fetching data:' + error);
            setState(prevState => ({
                ...prevState,
                isLoading: false,
                searching: false
            }));
        }
    };

    return (
        <div className="page">
            <div className="learning-modules-container">
                <h1 className="learning-page-title">Financial Learning</h1>
                
                {/* Recommended Module Section */}
                {state.recommendedModule && (
                    <RecommendedModuleCard 
                        module={state.recommendedModule}
                        reason="Recommended because you viewed stock analysis twice this week and started the module."
                        progress={state.moduleProgress[state.recommendedModule.id] || 0}
                    />
                )}
                
                {/* Search Bar */}
                <ModuleSearchBar 
                    searchRef={searchRef}
                    onSearch={selectData}
                    onKeyUp={checkInput}
                    isSearching={state.searching}
                />
                
                {/* All Learning Modules Section */}
                <h2 className="modules-section-title">All Learning Modules</h2>
                
                {state.isLoading ? (
                    <div className="modules-loading">Loading modules...</div>
                ) : state.modules && state.modules.length > 0 ? (
                    <div className="modules-grid">
                        {state.modules.map((module, index) => (
                            <ModuleCard 
                                key={module.id || index}
                                module={module}
                                progress={state.moduleProgress[module.id] || 0}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="modules-error">
                        {state.searching ? "No modules found matching your search." : "Error: Unable to load the learning modules"}
                    </div>
                )}
            </div>
        </div>
    );
}