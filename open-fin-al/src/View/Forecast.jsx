// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import binaryHeader from "../Asset/Image/binary_header.jpg";
import aiHeader from "../Asset/Image/ai_header.jpg";
import { HeaderContext } from "./App/LoadedLayout";

class Forecast extends Component {
    static contextType = HeaderContext;
        
    async componentDidMount() {
        window.console.log("Portfolio context in componentDidMount:", this.context);
        const { setHeader } = this.context || {};
        
        if (setHeader) {
            setHeader({
                title: "Forecast",
                icon: "timeline",
            });
        }
    }

    dataFeatureCardStyle = {
      backgroundImage: `url(${binaryHeader})`
    }

    modelCardStyle = {
      backgroundImage: `url(${aiHeader})`
    }

    render() {
        return (
            <div className="page">
                <p>
                    There are many different models that can be used to forecast movements in the market.
                </p>
                <section className="cardRow">
                    <NavLink to="/forecast-features">
                      <div className="card">
                        <div className="cardHeader" style={this.dataFeatureCardStyle}></div>
                        <div className="cardContainer">
                            <h3>Create Custom Data Features</h3>
                            <p>If you would like to create custom data features for prediction and forecasting models, this page will help you do so. For example, you can choose different types windows for moving average calculations. You can save your data features and use them in different forecasting models.</p>
                        </div>
                      </div>
                    </NavLink>
                    <NavLink to="/forecast-models">
                      <div className="card">
                        <div className="cardHeader" style={this.modelCardStyle}></div>
                        <div className="cardContainer">
                          <h3>Select a Forecasting Model</h3>
                          <p>Select and run forecasts using different forecasting models. You can select from traditional time series models like ARIMA, or machine learning and AI models like random forests and deep learning.</p>
                        </div>
                      </div>
                    </NavLink>
                </section>
            </div>
        );
    }
}

export default Forecast;
