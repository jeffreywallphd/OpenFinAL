// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React from "react";
import {JSONRequest} from "../Gateway/Request/JSONRequest";
import { SymbolSearchBar } from "./Shared/SymbolSearchBar";
import { FinancialRatioInteractor } from "../Interactor/FinancialRatioInteractor";

function StockAnalysisSearchBar(props) {
    //Gets SEC data for a ticker
    const fetchRatioData = async (newState) => {
        try{
            //TODO: we need to get the CIK from the database. If this is captured in the securitiesList, we don't need a database lookup                    
            //TODO: create a parent interactor that can send a single request and dispatch
            var cik = null;

            newState.securitiesList.find((element) => {
                if(element.symbol === newState.searchRef) {
                    cik = element.cik;
                }
            });

            if(cik) {
                //get SEC data through SEC interactor
                var secInteractor = new FinancialRatioInteractor();
                var secRequestObj = new JSONRequest(`{
                    "request": {
                        "sec": {
                            "action": "overview",
                            "cik": "${cik}",
                            "ticker": "${newState.searchRef}"
                        }
                    }
                }`);

                const secResults = await secInteractor.get(secRequestObj);

                //update the state
                newState.secData = secResults;
                newState.secSource = secResults.response.source;
                newState.cik = cik;
                newState.comparisonData[newState.cik] = secResults;
                newState.isFirstLoad = false;
                
                props.handleDataChange(newState);

                return newState;
            }
        } catch(error) {
            newState.isFirstLoad = false;
            return newState;
        }
    }

    const handleSymbolChange = (newState) => {
        props.handleDataChange(newState);
    };
    
    return (
        <SymbolSearchBar fetchData={fetchRatioData} state={props.state} onSymbolChange={handleSymbolChange}/>
    );
}

export { StockAnalysisSearchBar }