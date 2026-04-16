// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useContext, useEffect, useMemo } from "react";
import { withViewComponent } from "../hoc/withViewComponent";
import { ViewComponent } from "../types/ViewComponent";
import { NewsSearchBar } from "./News/SearchBar";
import { NewsListing } from "./News/Listing";
import { DataContext } from "./App/DataContext";
import { useHeader } from "./App/LoadedLayout";

const WrappedNewsSearchBar = withViewComponent(NewsSearchBar);
const WrappedNewsListing = withViewComponent(NewsListing);

function NewsPage(props) {
    const { state, setState } = useContext(DataContext);

    const { setHeader } = useHeader();

    useEffect(() => {
        setHeader({
        title: "Investment News",
        icon: "article",
        });
    }, [setHeader]);

    useEffect(() => {
        setState({
            ...state
        });
    }, [state.newsData, state.data, state.searchRef, state.secData]);

    useEffect(() => {
        setState({
            ...state
        });
    }, []);

    const handleDataChange = (newState) => {
        setState(newState);
    };

    const newsSearchBarConfig = useMemo(() => new ViewComponent({
        height: 50, width: 400, isContainer: false, resizable: false,
        maintainAspectRatio: false, widthRatio: 1, heightRatio: 1,
        heightWidthRatioMultiplier: 0, visible: true, enabled: true,
        label: "News Search Bar", description: "Search bar for finding news articles",
        tags: ["news", "search"], minimumProficiencyRequirements: {}, requiresInternet: true,
    }), []);

    const newsListingConfig = useMemo(() => new ViewComponent({
        height: 120, width: 600, isContainer: false, resizable: true,
        maintainAspectRatio: false, widthRatio: 5, heightRatio: 1,
        heightWidthRatioMultiplier: 0, visible: true, enabled: true,
        label: "News Listing", description: "List view of news articles",
        tags: ["news", "listing"], minimumProficiencyRequirements: {}, requiresInternet: true,
    }), []);

    return (
        <div className="page">
            {state ?
            (
                <>
                    <WrappedNewsSearchBar state={state} handleDataChange={handleDataChange} viewConfig={newsSearchBarConfig}/>

                    {state.isLoading ?
                        (<p>Loading...</p>) :
                        state.error ?
                            (<p className="error">The ticker you entered is not valid or news data is available for this stock.</p>) :
                            (
                                <>
                                    <p>Data Source: {state.newsSource}</p>
                                    {state.newsData && state.newsData.response.results[0] ?
                                        state.newsData.response.results[0]["data"].map((listing, index) => (
                                            <WrappedNewsListing key={index} state={state} listingData={listing} viewConfig={newsListingConfig}/>
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

export function News(props) {
    return <NewsPage />;
}
