// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useContext, useEffect } from "react";
import { NewsSearchBar } from "./News/SearchBar";
import { NewsListing } from "./News/Listing";
import { DataContext } from "./App";

function NewsPage(props) {
    const { state, setState } = useContext(DataContext);
    
    //ensure that the state changes
    useEffect(() => {
        setState({
            ...state
        })
    }, [state.newsData, state.data, state.searchRef, state.secData]);

    const handleDataChange = (newState) => {
        setState(newState);
    };

    return (
        <div className="page">
            <h2><span className="material-icons">article</span> Investment News </h2>
            
            {state ?
            (
                <>
                    <NewsSearchBar state={state} handleDataChange={handleDataChange}/>

                    {state.isLoading ?
                        (<p>Loading...</p>) :
                        state.error ?
                            (<p className="error">The ticker you entered is not valid or news data is available for this stock.</p>) :
                            (
                                <>
                                    <p>Data Source: {state.newsDataSource}</p>
                                    {state.newsData && state.newsData.response.results[0]?
                                        state.newsData.response.results[0]["data"].map((listing, index) => (
                                            <NewsListing key={index} state={state} listingData={listing}/>
                                        )) :
                                        null
                                    }
                                </>
                            )
                        }
                    </>
                ) :
                (
                    <div>Please enter a ticker symbol to search for news about a company</div>
                )
            }
        </div>
    );
}

// In case hooks are needed for this class. Can remove later if not necessary
export function News(props) {
    return <NewsPage />
};