// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { Component } from "react";
import { NewsSearchBar } from "./News/NewsSearchBar";
import { NewsListing } from "./News/NewsListing";
import ConfigUpdater from "../Utility/ConfigManager";

class NewsPage extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        initializing: true,
        data: null,
        error: null,
        isLoading: false,
        config: null
    };

    //Used to pass data from the search bar to the chart
    handleDataChange = (state) => {
        this.setState(state);
    }

    async getConfig() {
        const configManager = new ConfigUpdater();
        const newState = this.state;
        newState.config = await configManager.getConfig();
        this.handleDataChange(newState);
    }

    render() {   
        this.getConfig();     
        return (
                <div className="page">
                    <h2><span className="material-icons">article</span> Investment News </h2>
                    <NewsSearchBar state={this.state} onDataChange={this.handleDataChange}/>
                   <br></br>
                    {
                        (this.state.data !== null ? 
                            this.state.data.response.results[0]["data"].map((listing, index) => (
                                <NewsListing key={index} state={this.state} listingData={listing}/>
                            ))
                        : 
                            <div>Please enter a ticker symbol to search for news about a company</div>
                    )} 
                </div>
        );
    }
}

// In case hooks are needed for this class. Can remove later if not necessary
export function News() {
    return <NewsPage />
};