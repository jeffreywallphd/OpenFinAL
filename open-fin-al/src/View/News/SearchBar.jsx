// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useEffect } from "react";
import {NewsInteractor} from "../../Interactor/NewsInteractor";
import {JSONRequest} from "../../Gateway/Request/JSONRequest";
import { SymbolSearchBar } from "../Shared/SymbolSearchBar";

function NewsSearchBar(props) {
    //TODO: implement error handling
    const fetchNews = async (newState) => {
        newState.isLoading = true;
        props.handleDataChange(newState);

        var companyName = "";
        var cik = "";
        newState.securitiesList.find((element) => {
            if(element.ticker === newState.searchRef) {
                companyName = element.companyName;
                cik = element.cik;
            }
        });

        //get data through stock interactor
        var interactor = new NewsInteractor();
        var requestObj = new JSONRequest(`{ 
            "request": { 
                "news": {
                    "action": "searchByTicker",
                    "ticker": "${newState.searchRef}",
                    "companyName": "${companyName}"
                }
            }
        }`);

        const results = await interactor.get(requestObj);

        if(results.status && results.status === 400) {
            newState.error = true;
            newState.initializing = true;
            newState.ticker = newState.searchRef;
            newState.cik = cik;
            newState.isLoading = false;
            newState.isFirstLoad = false;
            props.handleDataChange(newState);
            return;
        }

        //Update the state
        newState.error = false;
        newState.initializing = true;
        newState.newsData = results;
        newState.newsSource = results.source;
        newState.ticker = newState.searchRef;
        newState.cik = cik;
        newState.isLoading = false;
        newState.isFirstLoad = false;

        props.handleDataChange(newState);
    }

    useEffect(() => {
        var newState = props.state;

        props.handleDataChange(newState);
        
        if(props.state.searchRef) {
            newState.isLoading = true;
            fetchNews(props.state);
        }
    }, []);

    const handleSymbolChange = (newState) => {
        props.handleDataChange(newState);
    };

    return (
        <SymbolSearchBar fetchData={fetchNews} state={props.state} onSymbolChange={handleSymbolChange}/>
    );
}

export { NewsSearchBar }