import React, { Component, useContext, useEffect, useState } from "react";
import { TickerSearchBar } from "../Stock/TickerSearchBar";
import { TickerSidePanel } from "../Stock/TickerSidePanel";
import { DataContext } from "../App";
import { RiskSurvey } from "./RiskSurvey";
import { Survey } from "../SurveyTemplate/Survey";
// import yahooFinance from "yahoo-finance";

const questionSet1 = [
    {
        id: 1,
        text: "How would you define investment risk?",
        options: [
            { value: 1, label: "The possibility of losing money" },
            { value: 2, label: "Market fluctuations" },
            { value: 3, label: "A chance for greater returns" }
        ]
    },
    {
        id: 2,
        text: "What is the largest percentage drop in your investment portfolio you could accept ?",
        options: [
            { value: 1, label: "I can't tolerate any losses" },
            { value: 2, label: "I prefer to avoid a loss greater than 15%" },
            { value: 3, label: "I'm okay with a 20% loss" },
            { value: 4, label: "I can handle significant drops" }
        ]
    },
    {
        id: 3,
        text: "If you faced sudden job loss two months before a planned luxury vacation, your response would be to",
        options: [
            { value: 1, label: "Cancel the vacation completely" },
            { value: 2, label: "Scale down to a more affordable trip" },
            { value: 3, label: "Proceed with the vacation as planned" }
        ]
    },
    {
        id: 4,
        text: "During the last major market downturn, your actions were:",
        options: [
            {value: 1, label: "Sold some or all of my holdings"},
            {value: 2, label: "Did nothing"},
            {value: 3, label: "Invested more in stocks"}
        ]
    },
    {
        id: 5,
        text: "If you won $5000, how would you consider using it?",
        options: [
            {value: 1, label: "keep it as cash"},
            {value: 2, label: "Invest it in stocks"},
            {value: 3, label: "gamble it for a chance at a bigger win"}
        ]
    },
    {
        id: 6,
        text: "How do you respond to stock market fluctuations?",
        options: [
            {value: 1, label: "I sell my stocks immediately"},
            {value: 2, label: "I hold and monitor the situation"},
            {value: 3, label: "I view it a buying opportunity"}
        ]
    },
    {
        id: 7,
        text: "If your stocks dropped 30% in value, your reaction would be:",
        options: [
            {value: 1, label: "Sell to minimum loss"},
            {value: 2, label: "Hold on and wait for recovery"},
            {value: 3, label: " Invest more to average down"}
        ]
    },
    {
        id: 8,
        text: "What is your primary goal of investing ?",
        options: [
            {value: 1, label: "Preserve my capital"},
            {value: 2, label: "Long-term wealth accumulation"},
            {value: 3, label: "Quick profits"}
        ]
    },
    {
        id: 9,
        text: "How comfortable are you with investing in high-risk stocks ?",
        options: [
            {value: 1, label : "Not comfortable at all"},
            {value: 2, label: "Somewhat comfortable"},
            {value: 3, label: "Very Comfortable"}
        ]
    },
    {
        id: 10,
        text: "What is your attitude towords market corrections ?",
        options: [
            {value: 1, label: "I dont focus on them much"},
            {value: 2, label: "I prefer to withdraw my investment"},
            {value: 3, label: "I see them as opportunities to invest"}
        ]
    },
    {
        id: 11,
        text: "How do you feel about leveraging investments, such as using margin ?",
        options: [
            {value: 1, label: "Not comfortable at all"},
            {value: 2, label: "Somewhat comfortable"},
            {value: 3, label: "Very Comfortabele with it"}
        ]
    }
];

const questionSet2 = [
    {
        id: 12,
        text: "How long have you been actively investing in stocks?",
        options: [
            { value: 1, label: "Less than 2 years" },
            { value: 2, label: "2-4 years" },
            { value: 3, label: "5-8 years" },
            { value: 4, label: "More than 8 years"}
        ]
    },
    {
        id: 13,
        text: "What percentage of your total investments is currently in stocks?",
        options: [
            { value: 1, label: "Below 30%" },
            { value: 2, label: "30-60%" },
            { value: 3, label: "60-80%" },
            { value: 4, label: "Over 80%" }
        ]
    },{
        id: 14,
        text: "Which type of stocks are you most interested in?",
        options: [
            { value: 1, label: "Established blue-chip stocks" },
            { value: 2, label: "Income Generating Stocks" },
            { value: 3, label: "Growth Stocks" }
        ]
    },{
        id: 15,
        text: "How do you rate your understanding of investing concepts?",
        options: [
            { value: 1, label: "Not very knowledgeable" },
            { value: 2, label: "Moderately knowleadgeble" },
            { value: 3, label: "Very knowledgeable" }
        ]
    },{
        id: 16,
        text: "Do any of your friends or family frequently invest in stocks?",
        options: [
            { value: 1, label: "No, they don't invest in stocks" },
            { value: 2, label: "Occassionally, some invest" },
            { value: 3, label: "yes, they are active investors" }
        ]
    },{
        id: 17,
        text: "How likely are you to seek advice from financial professionals?",
        options: [
            { value: 1, label: "Not likely at all" },
            { value: 2, label: "Somewhat likely" },
            { value: 3, label: "Very likely" }
        ]
    },{
        id: 18,
        text: "How frequently do you review your investment portfolio?",
        options: [
            { value: 1, label: "Infrequently" },
            { value: 2, label: "Monthly" },
            { value: 3, label: "Weekly" }
        ]
    }
];

const questionSet3 = [
    {
        id: 19,
        text: "How do you monthly income bracket?",
        options: [
            { value: 1, label: "$2000 $5000" },
            { value: 2, label: "$5001 to $10000" },
            { value: 3, label: "$10001 to $20000" },
            { value: 4, label: "Over $20000" }
        ]
    },
    {
        id: 20,
        text: "What do you estimate your monthly living expenses to be?",
        options: [
            { value: 1, label: "More than $10000" },
            { value: 2, label: "$5001 to $10000" },
            { value: 3, label: "$2001 to $5000" },
            { value: 4, label: "$100 to $2000" }
        ]
    },{
        id: 21,
        text: "What is your total outstanding debt?",
        options: [
            { value: 1, label: "More than $50000" },
            { value: 2, label: "$25001 to $50000" },
            { value: 3, label: "$10001 to $25000" },
            { value: 4, label: "$0 to $10000" }
        ]
    },{
        id: 22,
        text: "Estimate your total net worth (asserts minus liabilities)",
        options: [
            { value: 1, label: "$0 to $25000" },
            { value: 2, label: "$25001 to $50000" },
            { value: 3, label: "$50001 to $100000" },
            { value: 4, label: "More than $100000" }
        ]
    },{
        id: 23,
        text: "Do you have an emergency fund to cover unexpected expenses?",
        options: [
            { value: 1, label: "No, I do not have one" },
            { value: 2, label: "No, but i plan to create one" },
            { value: 3, label: "yes, but less than six months" },
            { value: 4, label: "yes, enough or more for six months" }
        ]
    },{
        id: 24,
        text: "If a new tech product catches your interest, what would you do?",
        options: [
            { value: 1, label: "Purchase it on credit" },
            { value: 2, label: "Use funds from your investment account" },
            { value: 3, label: "Pay for it using leftover savings" }
        ]
    }
];


const RiskAnalysis = () => {
    const { state, setState } = useContext(DataContext);


    const handleDataChange = (newData) => {
        console.log(newData);

        setState(newData);
    }

    return (
            <>
                <h1>Risk Analysis</h1>
                <TickerSearchBar state={state} handleDataChange={handleDataChange}/>
                {/* <TickerSidePanel state={state} analysisLoading={false} handleAIFundamentalAnalysis={console.log} fundamentalAnalysisDisabled={true} /> */}

                <Survey
                    title="Risk Assessment Survey"
                    disclaimer={<ul>
                                    <li>EEEEThis risk assessment survey is for informational purposes only.</li>
                                    <li>Your responses are not saved or stored anywhere.</li>
                                    <li>The results provided are indicative and should not be considered as professional financial advice.</li>
                                    <li>For actual investment decisions, please consult with a qualified financial advisor.</li>
                                </ul>}
                    setResult={console.log}
                    questions={questionSet1}
                />
            </>
    );
};


export default RiskAnalysis;