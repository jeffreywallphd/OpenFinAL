// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.


import React, { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { StockInteractor } from "../../Interactor/StockInteractor";
import { JSONRequest } from "../../Gateway/Request/JSONRequest";
import { UserInteractor } from "../../Interactor/UserInteractor";
import { PortfolioInteractor } from "../../Interactor/PortfolioInteractor";
import { OrderInteractor } from "../../Interactor/OrderInteractor"; 

function EconomicChart(props) {
    const [chartColor, setChartColor] = useState("#62C0C2");
    const [toolTipStyle, setToolTipStyle] = useState({
        contentStyle: {backgroundColor: '#FFFFFF'},
        labelStyle: {color: '#000000'},
        itemStyle: {color: "#62C0C2"}
    });
    

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    const formatterCent = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    var priceMinPadded;
    var priceMaxPadded;
    var volumeMax;

    var data = null;
    
    if(props.state.data) {
        data = props.state.data;
        //data = props.state.data.response.results[0]["data"];

        if((props.state.priceMax - props.state.priceMin) > 1.5) {
            //round to nearest dollar when difference between max and min price is in dollars
            //set min to 0 if max-min is less than 0
            priceMinPadded = (Math.floor(props.state.priceMin - ((props.state.priceMax - props.state.priceMin) * 0.2))) > 0 ? Math.round(props.state.priceMin - ((props.state.priceMax - props.state.priceMin) * 0.2)): 0;
            priceMaxPadded = Math.ceil(props.state.priceMax + ((props.state.priceMax - props.state.priceMin) * 0.2));
        } else {
            //round to nearest cent  mwhen difference between max and min price is in cents
            //set min to 0 if max-min is less than 0
            priceMinPadded = (Math.round((props.state.priceMin - ((props.state.priceMax - props.state.priceMin) * 0.2)) * 100)/100) > 0 ? Math.round((props.state.priceMin - ((props.state.priceMax - props.state.priceMin) * 0.2)) * 100)/100 : 0;
            priceMaxPadded = Math.round((props.state.priceMax + ((props.state.priceMax - props.state.priceMin) * 0.2)) * 100)/100;
        }   
    }

    //evenly spaces the ticks of the time series chart by putting the ticks in a fixed intervall into Array "ticks" determined by tickCount
    const tickCount = 2;
    const tickInterval = (priceMaxPadded - priceMinPadded) / (tickCount - 1);
    const ticks = Array.from({ length: tickCount }, (_, index) => (priceMinPadded + tickInterval * index).toFixed(2));

    //TODO: calculate a max value for the y-axis that adds a little padding to top of graph    
    //TODO: set the min value for the x-axis to 9:00 AM and the max value to 5:00 PM when intraday data
    return(<>
            <div>            
                {/* The actual chart displaying the data from recharts */}
                <AreaChart width={550} height={150} key="timeSeries" data={data} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey={"date"} domain={[props.state.yAxisStart, props.state.yAxisEnd]} />
                    <YAxis type="number" domain={[props.state.minPrice, props.state.maxPrice]} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <Tooltip 
                        contentStyle={toolTipStyle.contentStyle}
                        labelStyle={toolTipStyle.labelStyle}
                        itemStyle={toolTipStyle.itemStyle}
                    />
                    <Area type="monotone" dataKey="value" stroke={chartColor} fillOpacity={1} fill="url(#colorArea)" dot={false}/>
                </AreaChart>
            </div>
    </>);
} 

export { EconomicChart }