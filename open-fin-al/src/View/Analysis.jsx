// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.


import React, { Component, useState, useRef} from "react";
import { Popover } from "react-tiny-popover";


function Analysis(props) {
    // Create references that will be used to take in user input
    const Revenue = useRef("Revenue");
    const CostOfRevenue = useRef("CostOfRevenue");
    const GandAExpense = useRef("GandAExpense");
    const SandMExpense = useRef("SandMExpense");
    const InterestExpense = useRef("InterestExpense");
    const StockholdersEquity = useRef("StockholdersEquity");
    const Assets = useRef("Assets");
    const PreferredDividends = useRef("PreferredDividends");
    const WANSOB = useRef("WANSOB");
    const SharePrice = useRef("SharePrice");


    const confInt = useRef("confInt");


    const largeCS = useRef("largeCS");
    const midCS = useRef("midCS");
    const smallCS = useRef("smallCS");
    const microCS = useRef("microCS");


   


    // Define handleHover functions correctly
    const [hoveredInfo, setHoveredInfo] = useState(null);


    const handleInfoHover = (metric) => {
        setHoveredInfo(metric);
    };


    const handleInfoLeave = () => {
        setHoveredInfo(null);
    };


    //Create a key value pair data structure which will hold our variables which will be changeale in the html on the button click
        //Initialize each key
    const [state, setState] = useState({
        ROA: "-",
        ROE: "-",
        NPM: "-",
        EPS: "-",
        PER: "-",
        ROAGrade: "-",
        ROEGrade: "-",
        NPMGrade: "-",
        EPSGrade: "-",
        PERGrade: "-",
        overallScore: "-",
        overallScoreGrade: "-"
    })

    const [diversificationScore, setDiversificationScore] = useState({
        score: "-",
        grade: "-",
    })

    const replaceNegatives = (num) => {
        return num < 0 ? 0 : num;
    }

    const clearDiversification = () => {
        largeCS.current.value = "";
        midCS.current.value = "";
        smallCS.current.value = "";
        microCS.current.value = "";

        setDiversificationScore({
            score: "-",
            grade: "-"
        })

        setPieChart({
            margin: '20px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            backgroundImage: `conic-gradient(white 0% 100%)`,
            border: '2px solid black',
        })

    }

    const handleDiversification = () => {
        var largeCap = replaceNegatives(Number(largeCS.current.value));
        var midCap = replaceNegatives(Number(midCS.current.value));
        var smallCap = replaceNegatives(Number(smallCS.current.value));
        var microCap = replaceNegatives(Number(microCS.current.value));




        const total = largeCap + midCap + smallCap + microCap;




        largeCap = (largeCap / total) * 100;
        midCap = (100 * (midCap / total) ) + largeCap;
        smallCap = (100 * (smallCap / total) ) + midCap;


        setPieChart({
            margin: '20px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            backgroundImage: `conic-gradient(
                orange 0% ${largeCap}%,
                blue ${largeCap}% ${midCap}%,
                green ${midCap}% ${smallCap}%,
                purple ${smallCap}% 100%
            )`,
            border: '2px solid black',
        })


        setDiversificationScore({
            score: (Number(largeCS.current.value)*4+Number(midCS.current.value)*2+Number(smallCS.current.value)).toFixed(2),
            grade: calculateDiversityGrade(Number(largeCS.current.value), Number(midCS.current.value), Number(smallCS.current.value)),
        })
    }


    const calculateDiversityGrade = (large, mid, small) => {
        const score = large*4+mid*2+small;
        if(score > 2.5){
            return "A";
        }
        else if(score > 2){
            return "B";
        }
        else if(score > 1.5){
            return "C";
        }
        else if(score > 1){
            return "D";
        }
        else{
            return "F";
        }
    }
    const [pieChart, setPieChart] = useState ({
        margin: '20px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        backgroundImage: `conic-gradient(orange 0%, blue 0%, blue 0%, green 0%, green 0%, white 0%)`,
        border: '2px solid black',
    })


    const calculateROA = (NetIncome) => {
        return (NetIncome / Assets.current.value).toFixed(2);
    }
    const calculateROE = (NetIncome) => {
        return (NetIncome / StockholdersEquity.current.value).toFixed(2);
    }
    const calculateNPM = (NetIncome) => {
        return (NetIncome / Revenue.current.value).toFixed(2);
    }
    const calculateEPS = (NetIncome) => {
        return ((NetIncome - PreferredDividends.current.value) / WANSOB.current.value).toFixed(2);
    }
    const calculatePER = (NetIncome) => {
        return (SharePrice.current.value / ((NetIncome - PreferredDividends.current.value) / WANSOB.current.value)).toFixed(2);
    }
    const calculateOverallScore = (NetIncome) => {
        const roa = (NetIncome / Assets.current.value).toFixed(2);
        const roe = (NetIncome / StockholdersEquity.current.value).toFixed(2);
        const npm = (NetIncome / Revenue.current.value).toFixed(2);
        const eps = ((NetIncome - PreferredDividends.current.value) / WANSOB.current.value).toFixed(2);
        const per = (SharePrice.current.value / ((NetIncome - PreferredDividends.current.value) / WANSOB.current.value)).toFixed(2);
        return (roa*0.25 + roe*0.2 + npm*0.15 + eps*0.25 + per*0.15).toFixed(2);
    }
   
    const calculateROAGrade = (NetIncome) => {
        const roa = (NetIncome / Assets.current.value).toFixed(2);
        var letterGrade = null;
        if(roa > 0.12){
            letterGrade = "A";
        }
        else if(roa > 0.08){
            letterGrade = "B";
        }
        else if(roa > 0.04){
            letterGrade = "C";
        }
        else if(roa > 0){
            letterGrade = "D";
        }
        else{
            letterGrade = "F";
        }
        return letterGrade;
    }


    const calculateROEGrade = (NetIncome) => {
        const roe = (NetIncome / StockholdersEquity.current.value).toFixed(2);
        var letterGrade = null;
        if(roe > 0.20){
            letterGrade = "A";
        }
        else if(roe > 0.15){
            letterGrade = "B";
        }
        else if(roe > 0.10){
            letterGrade = "C";
        }
        else if(roe > 0.5){
            letterGrade = "D";
        }
        else{
            letterGrade = "F";
        }
        return letterGrade;
       
    }
    const calculateNPMGrade = (NetIncome) => {
        const npm = (NetIncome / Revenue.current.value).toFixed(2);
        var letterGrade = null;
        if(npm > 0.12){
            letterGrade = "A";
        }
        else if(npm > 0.08){
            letterGrade = "B";
        }
        else if(npm > 0.04){
            letterGrade = "C";
        }
        else if(npm > 0){
            letterGrade = "D";
        }
        else{
            letterGrade = "F";
        }
        return letterGrade;
    }
    const calculateEPSGrade = (NetIncome) => {
        const eps = ((NetIncome - PreferredDividends.current.value) / WANSOB.current.value).toFixed(2);
        var letterGrade = null;
        if(eps > 0.12){
            letterGrade = "A";
        }
        else if(eps > 0.08){
            letterGrade = "B";
        }
        else if(eps > 0.04){
            letterGrade = "C";
        }
        else if(eps > 0){
            letterGrade = "D";
        }
        else{
            letterGrade = "F";
        }
        return letterGrade;
    }
    const calculatePERGrade = (NetIncome) => {
        const per = (SharePrice.current.value / ((NetIncome - PreferredDividends.current.value) / WANSOB.current.value)).toFixed(2);
        var letterGrade = null;
        if(per > 0.12){
            letterGrade = "A";
        }
        else if(per > 0.08){
            letterGrade = "B";
        }
        else if(per > 0.04){
            letterGrade = "C";
        }
        else if(per > 0){
            letterGrade = "D";
        }
        else{
            letterGrade = "F";
        }
        return letterGrade;
    }


    const calculateOverallScoreGrade = (NetIncome) => {
        const roa = (NetIncome / Assets.current.value).toFixed(2);
        const roe = (NetIncome / StockholdersEquity.current.value).toFixed(2);
        const npm = (NetIncome / Revenue.current.value).toFixed(2);
        const eps = ((NetIncome - PreferredDividends.current.value) / WANSOB.current.value).toFixed(2);
        const per = (SharePrice.current.value / ((NetIncome - PreferredDividends.current.value) / WANSOB.current.value)).toFixed(2);
        const overallScore = roa*0.25 + roe*0.2 + npm*0.15 + eps*0.25 + per*0.15;
        var letterGrade = null;
        if(overallScore > 0.12){
            letterGrade = "A";
        }
        else if(overallScore > 0.08){
            letterGrade = "B";
        }
        else if(overallScore > 0.04){
            letterGrade = "C";
        }
        else if(overallScore > 0){
            letterGrade = "D";
        }
        else{
            letterGrade = "F";
        }
        return letterGrade;
    }


    const handleClick = () => {
        const NetIncome = Revenue.current.value - CostOfRevenue.current.value - GandAExpense.current.value - SandMExpense.current.value - InterestExpense.current.value
        setState({
            ROA: calculateROA(NetIncome),
            ROE: calculateROE(NetIncome),
            NPM: calculateNPM(NetIncome),
            EPS: calculateEPS(NetIncome),
            PER: calculatePER(NetIncome),
            ROAGrade: calculateROAGrade(NetIncome),
            ROEGrade: calculateROEGrade(NetIncome),
            NPMGrade: calculateNPMGrade(NetIncome),
            EPSGrade: calculateEPSGrade(NetIncome),
            PERGrade: calculatePERGrade(NetIncome),
            overallScore: calculateOverallScore(NetIncome),
            overallScoreGrade: calculateOverallScoreGrade(NetIncome)
        });
    }

    const clearForm = () => {
        Revenue.current.value = '';
        CostOfRevenue.current.value = '';
        GandAExpense.current.value = '';
        SandMExpense.current.value = '';
        InterestExpense.current.value = '';
        PreferredDividends.current.value = '';
        Assets.current.value = '';
        StockholdersEquity.current.value = '';
        WANSOB.current.value = '';
        SharePrice.current.value = '';
   
        setState({
            ROA: '-',
            ROE: '-',
            NPM: '-',
            EPS: '-',
            PER: '-',
            ROAGrade: '-',
            ROEGrade: '-',
            NPMGrade: '-',
            EPSGrade: '-',
            PERGrade: '-',
            overallScore: '-',
            overallScoreGrade: '-'
        });
    };
   
   
    return (
            <div className="page riskPage">
                <div className="riskTitleContainer">
                    <span className="material-icons riskIcon">assessment</span><h2 style={{margin: "0px"}}>Risk Analysis</h2>
                </div>
                <div className='riskBody'>
                <div className="riskContainer">
    
    <h3 className="riskHeader"><b>Stock Info</b></h3>
    <div className="ROAbox inputGroup">
        <Popover
            isOpen={hoveredInfo === "Revenue"}
            positions={["bottom"]}
            content={<div className="popoverContent">
                    Revenue represents the total amount of money earned by the company before expenses. Higher revenue typically indicates a larger and more successful company.
                </div>}>

            <label
            className="inputLabel"
            onMouseEnter={() => handleInfoHover("Revenue")}
            onMouseLeave={handleInfoLeave}
            >
                Revenue 🛈
            </label>
        </Popover>
        
        <input type="text" ref={Revenue} className="userInput" placeholder="" />
    </div>


    <div className="ROIbox inputGroup">
    <Popover
            isOpen={hoveredInfo === "CostOfRevenue"}
            positions={["bottom"]}
            content={<div className="popoverContent">
                    Cost of Revenue is the total expenses incurred to produce goods or services that are sold by the company. It helps determine the profitability of the company's core operations.
                </div>}>

        <label
            className="inputLabel"
            onMouseEnter={() => handleInfoHover("CostOfRevenue")}
            onMouseLeave={handleInfoLeave}
        >
            Cost of Revenue 🛈
        </label>
        </Popover>

        <input type="text" ref={CostOfRevenue} className="userInput" placeholder="" />
    </div>


    <div className="ROIbox inputGroup">
        <Popover 
        isOpen={hoveredInfo === "GandAExpense"}
        positions={["bottom"]}
        content={<div className="popoverContent">
                General and Administrative (G&A) Expenses are the overhead costs that are necessary for running a business, such as salaries, rent, utilities, etc.
            </div>}>
            <label
                className="inputLabel"
                onMouseEnter={() => handleInfoHover("GandAExpense")}
                onMouseLeave={handleInfoLeave}
            >
                G and A Expense 🛈
            </label>
        </Popover>
        
        <input type="text" ref={GandAExpense} className="userInput" placeholder="" />
    </div>


    <div className="ROIbox inputGroup">
        <Popover
            isOpen={hoveredInfo === "SandMExpense"}
            positions={["bottom"]}
            content={<div className="popoverContent">
                    Selling and Marketing (S&M) Expense refers to the costs associated with promoting and selling the company's products or services. This can include advertising, marketing campaigns, and sales team expenses.
                </div>}>

            <label
                className="inputLabel"
                onMouseEnter={() => handleInfoHover("SandMExpense")}
                onMouseLeave={handleInfoLeave}
            >
                S and M Expense 🛈
            </label>
        </Popover>

    <input type="text" ref={SandMExpense} className="userInput" placeholder="" />
</div>


<div className="ROEbox inputGroup">
    <Popover
     isOpen={hoveredInfo === "InterestExpense"}
     positions={["bottom"]}
     content={<div className="popoverContent">
             Interest Expense is the cost incurred by the company for borrowed funds. It reflects the amount of interest the company has to pay on its debts.
         </div>}>
        
        <label
            className="inputLabel"
            onMouseEnter={() => handleInfoHover("InterestExpense")}
            onMouseLeave={handleInfoLeave}
        >
            Interest Expense 🛈
        </label>
    </Popover>

    <input type="text" ref={InterestExpense} className="userInput" placeholder="" />
</div>


<div className="NPMbox inputGroup">
    <Popover
        isOpen={hoveredInfo === "StockholdersEquity"}
        positions={["bottom"]}
        content={<div className="popoverContent">
                Stockholders Equity represents the owners' residual interest in the company after all liabilities have been deducted. It is the difference between total assets and total liabilities.
        </div>}>
        <label
            className="inputLabel"
            onMouseEnter={() => handleInfoHover("StockholdersEquity")}
            onMouseLeave={handleInfoLeave}
        >
            Stockholders Equity 🛈
        </label>
    </Popover>

    <input type="text" ref={StockholdersEquity} className="userInput" placeholder="" />
</div>


<div className="NPMbox inputGroup">
    <Popover
        isOpen={hoveredInfo === "Assets"}
        positions={["bottom"]}
        content={<div className="popoverContent">
                Assets represent the resources owned by the company, such as cash, inventory, real estate, and equipment, that are expected to provide future economic benefits.
        </div>}>

        <label
        className="inputLabel"
        onMouseEnter={() => handleInfoHover("Assets")}
        onMouseLeave={handleInfoLeave}
        >
            Assets 🛈
        </label>
    </Popover>
    
    <input type="text" ref={Assets} className="userInput" placeholder="" />
</div>


<div className="EPSbox inputGroup">
    <Popover
        isOpen={hoveredInfo === "PreferredDividends"}
        positions={["bottom"]}
        content={<div className="popoverContent">
                Preferred Dividends are payments made to preferred stockholders before common stockholders receive any dividends. These are a fixed percentage of the stock's par value.
        </div>}
    >
        <label
            className="inputLabel"
            onMouseEnter={() => handleInfoHover("PreferredDividends")}
            onMouseLeave={handleInfoLeave}
        >
            Preferred Dividends 🛈
        </label>
    </Popover>
    
    <input type="text" ref={PreferredDividends} className="userInput" placeholder="" />
</div>


<div className="EPSbox inputGroup">
    <Popover
        isOpen={hoveredInfo === "WANSOB"}
        positions={["bottom"]}
        content={<div className="popoverContent"> 
                Weighted Average Number of Shares Outstanding (WANSOB) is the average number of shares of common stock that were outstanding during a specific period, adjusted for stock splits, dividends, and other changes.
        </div>}
    >
        <label
            className="inputLabel"
            onMouseEnter={() => handleInfoHover("WANSOB")}
            onMouseLeave={handleInfoLeave}
        >
            WANSOB 🛈
        </label>
    </Popover>
    
    <input type="text" ref={WANSOB} className="userInput" placeholder="" />
</div>


<div className="PERbox inputGroup">
    <Popover
        isOpen={hoveredInfo === "SharePrice"}
        positions={["bottom"]}
        content={<div className="popoverContent">
                Share Price is the current price at which a share of the company is being bought or sold in the stock market. It's often used as an indicator of the company's market value.
        </div>}
    >
        <label
            className="inputLabel"
            onMouseEnter={() => handleInfoHover("SharePrice")}
            onMouseLeave={handleInfoLeave}
        >
            Share Price 🛈
        </label>   
    </Popover>

    <input type="text" ref={SharePrice} className="userInput" placeholder="" />
   
</div>

<div className="inputGroup">
    <button className='bigbutton' onClick={clearForm}>Clear</button>
    <button className='bigbutton' onClick={handleClick}>Calculate Risk Scores</button>
</div>

</div>

<div className='riskContainer'>
    <h3 className="riskHeader">Risk Ratios</h3>

    <div className='bigScoreContainer'>
        <Popover
            isOpen={hoveredInfo === "ROA"}
            content={
                <div className="popoverContent">
                    A higher ROA (Return on Assets) indicates better efficiency in utilizing assets to generate profits, while a lower ROA may suggest inefficiency or underperformance.
                </div>
            }
        >
            <div onMouseEnter={() => handleInfoHover("ROA")} onMouseLeave={handleInfoLeave}>ROA 🛈</div>
        </Popover>
            <div className="scoreComponentContainer">    
                <div className='scoreComponent'> {state.ROA} </div>
                <div className='scoreComponent'> {state.ROAGrade} </div>
            </div>
    </div>

    <div className='bigScoreContainer'>
        <Popover
            isOpen={hoveredInfo === "ROE"}
            content={
                <div className="popoverContent">
                    A higher ROE (Return on Equity) means the company is better at making profits from its investments. Conversely, a lower ROE might mean the company isn't using its investments effectively relative to shareholder expectations.
                </div>
            }
        >
            <div onMouseEnter={() => handleInfoHover("ROE")} onMouseLeave={handleInfoLeave}>ROE 🛈</div>
        </Popover>
            <div className="scoreComponentContainer">    
                <div className='scoreComponent'> {state.ROE} </div>
                <div className='scoreComponent'> {state.ROEGrade} </div>
            </div>
    </div>

    <div className='bigScoreContainer'>
        <Popover
            isOpen={hoveredInfo === "NPM"}
            content={
                <div className="popoverContent">
                    A higher NPM (Net Profit Margin) suggests that a company is keeping more of its revenue as profit after accounting for expenses. Conversely, a lower NPM may indicate that the company is struggling to control its costs or facing challenges in generating profits from its operations.
                </div>
            }
        >
            <div onMouseEnter={() => handleInfoHover("NPM")} onMouseLeave={handleInfoLeave}>NPM 🛈</div>
        </Popover>
            <div className="scoreComponentContainer">    
                <div className='scoreComponent'> {state.NPM} </div>
                <div className='scoreComponent'> {state.NPMGrade} </div>
            </div>
    </div>

    <div className='bigScoreContainer'>
        <Popover
            isOpen={hoveredInfo === "EPS"}
            content={
                <div className="popoverContent">
                    A higher EPS (Earnings Per Share) indicates that a company is generating more profits for each share of its stock. On the other hand, a lower EPS might suggest that the company's profitability is decreasing or that its earnings are being diluted by issuing more shares.
                </div>
            }
        >
            <div onMouseEnter={() => handleInfoHover("EPS")} onMouseLeave={handleInfoLeave}>EPS 🛈</div>
        </Popover>
            <div className="scoreComponentContainer">    
                <div className='scoreComponent'> {state.EPS} </div>
                <div className='scoreComponent'> {state.EPSGrade} </div>
            </div>
    </div>

    <div className='bigScoreContainer'>
        <Popover
            isOpen={hoveredInfo === "PER"}
            content={
                <div className="popoverContent">
                    A lower P/E (Price-to-Earnings) ratio suggests that investors are paying less for each unit of the company's earnings, which may indicate the stock is undervalued. Conversely, a higher P/E ratio might mean that investors are paying more for each unit of earnings, which could suggest the stock is overvalued or that investors expect higher growth in the future.
                </div>
            }
        >
            <div onMouseEnter={() => handleInfoHover("PER")} onMouseLeave={handleInfoLeave}>PER 🛈</div>
        </Popover>
            <div className="scoreComponentContainer">    
                <div className='scoreComponent'> {state.PER} </div>
                <div className='scoreComponent'> {state.PERGrade} </div>
            </div>
    </div>

    <div className='bigScoreContainer'>
        <div><b>Ratio Score</b></div>
        <div className="scoreComponentContainer">    
            <div className='scoreComponent highlight'> {state.overallScore} </div>
            <div className='scoreComponent highlight'> {state.overallScoreGrade} </div>
        </div>
    </div>
</div>


{/* <div className='riskContainer'>
    <h3 className='riskHeader'>Your Timeline</h3>
    <h4 className='statHeader'>Investment Horizon</h4>
    <h4 className='statHeader'>Confidence Interval</h4>
    <input type='text' ref={confInt} className='userInput' placeholder='Confidence Interval'></input>
</div> */}


<div className='riskContainer' style={{justifyContent:"space-between"}}>
    <div style={{display: "flex", flexDirection: "column"}}>
        <h3 className='riskHeader'>Diversification</h3>
        <div className="pieChartContainer" >

            <div style={pieChart} className="hollow"><span>{diversificationScore.score}</span></div>

            <div className="keyColorsContainer">
                <div className="colorCodeBox">
                    <div className='keyColors' style={{ backgroundColor: 'orange' }}></div>
                    <div className='explanationText'>Large</div>
                </div>
                <div className="colorCodeBox">
                    <div className='keyColors' style={{ backgroundColor: 'blue' }}></div>
                    <div className='explanationText'>Mid</div>
                </div>
                <div className="colorCodeBox">
                    <div className='keyColors' style={{ backgroundColor: 'green' }}></div>
                    <div className='explanationText'>Small</div>
                </div>
                <div className="colorCodeBox">
                    <div className='keyColors' style={{ backgroundColor: 'purple' }}></div>
                    <div className='explanationText'>Micro</div>
                </div>
            </div>

        </div>

        <div className='bigScoreContainer'>

        <Popover
            isOpen={hoveredInfo === "diversityScore"}
            content={<div className="popoverContent">
                placeholder
            </div>}
        >
            
            <div onMouseEnter={() => handleInfoHover("diversityScore")} onMouseLeave={handleInfoLeave}><b>Diversity Score 🛈</b></div>
        </Popover>


            <div className="scoreComponentContainer">    
                <div className='scoreComponent highlight'> {diversificationScore.score} </div>
                <div className='scoreComponent highlight'> {diversificationScore.grade} </div>
            </div>
        </div>
    </div>
   
    <div className="diversificationInputContainer">
        <div className="diversificationInputRow">
            <div className="diversificationBox">
                <Popover
                    isOpen={hoveredInfo === "LargeCap"}
                    content={
                        <div className="popoverContent">
                            Large-cap stocks are shares of companies with a large market capitalization, typically valued at $10 billion or more. These companies are usually well-established and financially stable.
                        </div>
                    }
                >
                    <label
                        className="diversificationLabel"
                        onMouseEnter={() => handleInfoHover("LargeCap")}
                        onMouseLeave={handleInfoLeave}
                    >
                        Large-Cap Stocks 🛈
                    </label>
                </Popover>
                <input type="text" ref={largeCS} className="userInput diversificationInput" />
            </div>


            <div className="diversificationBox">
                <Popover
                    isOpen={hoveredInfo === "MidCap"}
                    content={
                        <div className="popoverContent">
                            Mid-cap stocks are shares of companies with a medium market capitalization, usually between $2 billion and $10 billion. These companies have growth potential but may be more volatile than large-cap stocks.
                        </div>
                    }
                >
                    <label
                        className="inputLabel"
                        onMouseEnter={() => handleInfoHover("MidCap")}
                        onMouseLeave={handleInfoLeave}
                    >
                        Mid-Cap Stocks 🛈
                    </label>
                </Popover>
                <input type="text" ref={midCS} className="userInput diversificationInput" />
            </div>
        </div>
   
        <div className="diversificationInputRow">
            <div className="diversificationBox">
                <Popover
                    isOpen={hoveredInfo === "SmallCap"}
                    content={
                        <div className="popoverContent">
                            Small-cap stocks are shares of companies with a small market capitalization, usually less than $2 billion. These stocks tend to be more volatile and carry higher risk but also offer higher growth potential.
                        </div>
                    }
                >
                    <label
                        className="inputLabel"
                        onMouseEnter={() => handleInfoHover("SmallCap")}
                        onMouseLeave={handleInfoLeave}
                    >
                        Small-Cap Stocks 🛈
                    </label>
                </Popover>
               
                <input type="text" ref={smallCS} className="userInput diversificationInput" />
            </div>

            <div className="diversificationBox">
                <Popover
                    isOpen={hoveredInfo === "MicroCap"}
                    content={
                        <div className="popoverContent">
                            Micro-cap stocks are shares of companies with a very small market capitalization, typically below $300 million. These stocks are considered high-risk investments but can potentially yield high rewards.
                        </div>
                    }
                >
                    <label
                        className="inputLabel"
                        onMouseEnter={() => handleInfoHover("MicroCap")}
                        onMouseLeave={handleInfoLeave}
                    >
                        Micro-Cap Stocks 🛈
                    </label>
                </Popover>
                <input type="text" ref={microCS} className="userInput diversificationInput" />
            </div>
        </div>
    </div>

    <div className="inputGroup">
        <button type="text" className="bigbutton" onClick={clearDiversification}>Clear</button>
        <button type="text" className="bigbutton" onClick={handleDiversification}>Check Diversification</button>
    </div>
    
</div>


                </div>
            </div>
    );
}


export { Analysis };
