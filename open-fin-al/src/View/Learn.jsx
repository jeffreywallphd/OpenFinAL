// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, useEffect, useRef } from "react";
import {
    NavLink,
    useLocation
} from "react-router-dom";
import { FaSearch } from "react-icons/fa";

export function Learn() {
    const location = useLocation();
    const [state, setState] = useState({
        modules: null,
        isLoading: true,
        searching: false
    });
    const searchRef = useRef("SearchTextField");
    const filterRef = useRef("FilterSelect");

    useEffect(() => {
        selectData();
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
            setState({
                modules: state.modules,
                isLoading: state.isLoading,
                searching: true
            });
            
            // TODO: move this query building to a Gateway implementation for SQLite
            // so that it can easily be configured with other databases later
            const inputData = [];
            var query = "SELECT * FROM LearningModule"

            // TODO: use more sophisticated NLP query, such as: https://www.sqlite.org/fts5.html
            if(searchRef.current.value !== "") {
                query += " WHERE keywords LIKE '%' || ? || '%'";
                inputData.push(searchRef.current.value);
            }

            if(filterRef.current.value !== "" && searchRef.current.value !== "") {
                query += " AND category=?";
                inputData.push(filterRef.current.value);
            } else if(filterRef.current.value !== "") {
                query += " WHERE category=?";
                inputData.push(filterRef.current.value);
            }

            query += " ORDER BY dateCreated DESC, title ASC"
            
            query += " LIMIT ?"
            const limit = 25;
            inputData.push(limit);
            window.console.log(query);
            await window.database.SQLiteSelectData({ query, inputData }).then((data) => {
                setState({
                    modules: data,
                    isLoading: false,
                    searching: false
                  });
            });
        } catch (error) {
            console.error('Error fetching data:' + error);
        }
    };

    window.console.log(window.electronApp.getAssetPath());

    return (
        <div className="page">
            <h2><span className="material-icons">school</span> Financial Learning Modules</h2>
            <form onSubmit={async (e) => {
                e.preventDefault();
                await selectData();
            }}>
                <div>
                    <input className="priceSearchBar" type="text" ref={searchRef}
                            onKeyUp={(e) => checkInput(e)} placeholder="Please enter a topic to learn about"></input>
                    <button className="priceSearchButton" type="submit" disabled={state.searching}><FaSearch/></button>
                </div>
                <div>&nbsp;</div>
                <div>
                    <span>Filter by: </span>
                    <select ref={filterRef} onChange={selectData}>
                        <option value="">Select a Category...</option>
                        <option value="Stock">Stocks</option>
                        <option value="Index">Index Funds</option>
                        <option value="Bond">Bonds</option>
                        <option value="Tax">Taxes</option>
                        <option value="RiskAnalysis">Risk Analysis</option>
                        <option value="MLAI">Machine Learning and AI</option>
                    </select>
                </div>
            </form>
            { state.modules ? 
                ( state.modules.map((module, index) => (
                    <div key={index}>
                        <h3>{module.title}</h3>
                        <p>Description: {module.description}</p>
                        <p>Estimated Time: {module.timeEstimate} minutes</p>
                        <NavLink to="/learningModule" state={{
                            moduleId: module.id,
                            title: module.title,
                            description: module.description,
                            timeEstimate: module.timeEstimate,
                            dateCreated: module.dateCreated,
                            fileName: module.fileName,
                            pages: null}}>View Module</NavLink>
                    </div>)))
                : state.isLoading === true ? 
                    (<div>Loading...</div>)
                :
                    (<div>Error: Unable to load the learning modules</div>)
                
            }
        </div>
    );
}