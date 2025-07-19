// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useState, useRef, useEffect } from "react";
import {StockInteractor} from "../../Interactor/StockInteractor";
import {JSONRequest} from "../../Gateway/Request/JSONRequest";
import { FaSearch } from "react-icons/fa";

function SymbolSearchBar(props) {
    const [securitiesList, setSecuritiesList] = useState(null);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef("META");
    
    //Checks the keyUp event to determine if a key was hit or a datalist option was selected
    const checkInput = async (e) => {
        if(e.key === "Enter") {
            //hide the securities list after completion of search
            setSecuritiesList(null);

            //fetch symbol and then fetch related data
            const newState = await fetchSymbol();
            await props.fetchData(newState);
            return;
        } else if (e.key === "Unidentified") {
            //Unidentified means datalist option was selected, otherwise a key was hit
            //fetch symbol and then fetch related data
            const newState = await fetchSymbol();
            await props.fetchData(newState);
        } else {
            await fetchSymbol();
        }
    }    

    //Gets potential tickers based on the current input in the search bar
    const fetchSymbol = async () => {
        if (searchRef.current.value != "") {
            try {
                setSearching(true);

                //make sure the symbol is all caps
                searchRef.current.value = (searchRef.current.value).toUpperCase();

                //get data through stock interactor
                var interactor = new StockInteractor();
                var requestObj = new JSONRequest(`{ 
                    "request": { 
                        "stock": {
                            "action": "lookup",
                            "keyword": "${searchRef.current.value}"
                        }
                    }
                }`);

                const searchData = await interactor.get(requestObj);
                setSecuritiesList(searchData.response.results);
                
                //Update the state to be passed to the fetch data function
                const newState = {
                    ...props.state,
                    initializing: false,
                    data: props.state.data,
                    newsData: props.state.newsData,
                    secData: props.state.secData,
                    ticker: props.state.ticker,
                    cik: props.state.cik,
                    error: props.state.error,
                    type: "intraday",
                    interval: "1D",
                    securitiesList: searchData.response.results,
                    searchRef: searchRef.current.value,
                    isLoading: false,
                    priceMin: props.state.priceMin,
                    priceMax: props.state.priceMax,
                    maxVolume: props.state.maxVolume,
                    yAxisStart: props.state.yAxisStart,
                    yAxisEnd: props.state.yAxisEnd
                };

                return newState;
            } finally {
                setSearching(false);
            }
        } 
    };

    useEffect(() => {
        if(props.state.searchRef) {
            searchRef.current.value = props.state.searchRef;
        }
    }, [props.state.searchRef]);

    return (
        <>
            <div className="priceSearchFormContainer">
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    //Fetch symbol to make sure we are caught up before fetching data
                    const newState = await fetchSymbol();
                    props.fetchData(newState);
                }}>
                    <input className="priceSearchBar" type="text" list="tickers" ref={searchRef}
                           onKeyUp={(e) => checkInput(e)} placeholder="Please enter a ticker symbol"></input>

                    {securitiesList ?
                        <datalist id="tickers" className="tickersList">
                            {securitiesList.map((listData) => (
                                <option key={listData.id} value={listData.symbol}>
                                    {listData.name}
                                </option>
                            ))}
                        </datalist>
                        : null
                    }
                    <button className="priceSearchButton" type="submit" disabled={searching}><FaSearch/></button>
                </form>
            </div>
            <div>

            </div>
        </>
    );
}

export { SymbolSearchBar }