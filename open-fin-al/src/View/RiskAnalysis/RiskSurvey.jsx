import React, { useState } from 'react';
import { Survey } from "../SurveyTemplate/Survey";

// Helper function to convert normalized risk level to risk class
const getRiskClassFromLevel = (level) => {
    if (level < 0.2) return 'low';
    else if (level < 0.4) return 'low/mid';
    else if (level < 0.6) return 'mid';
    else if (level < 0.8) return 'mid/high';
    else return 'high';
};

// ancient question sets, saved but not currently in use
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

const currentQuestions = [
  {
    id: 0,
    text: "How would you feel if your portfolio dropped 20% in a month?",
    options: [
      { value: 1, label: "Very anxious — I’d want to sell immediately" },
      { value: 2, label: "Concerned — I’d consider reducing exposure" },
      { value: 3, label: "Uncomfortable but I’d likely hold" },
      { value: 4, label: "Unbothered — I’d see it as a buying opportunity" }
    ]
  },
  {
    id: 1,
    text: "What’s the largest percentage loss you could tolerate before feeling compelled to sell?",
    options: [
      { value: 1, label: "Less than 10%" },
      { value: 2, label: "10–20%" },
      { value: 3, label: "20–35%" },
      { value: 4, label: "Over 35%" }
    ]
  },
  {
    id: 2,
    text: "Do you lose sleep or get anxious when markets are volatile?",
    options: [
      { value: 1, label: "Yes, it keeps me up at night" },
      { value: 2, label: "Sometimes, but I try not to worry" },
      { value: 3, label: "Rarely — I can tolerate ups and downs" },
      { value: 4, label: "No — I stay calm and focused on the long term" }
    ]
  },
  {
    id: 3,
    text: "Would you describe yourself as a cautious, moderate, or aggressive investor?",
    options: [
      { value: 1, label: "Very cautious" },
      { value: 2, label: "Moderate" },
      { value: 3, label: "Growth-oriented" },
      { value: 4, label: "Aggressive / high-risk taker" }
    ]
  },
  {
    id: 4,
    text: "Do you focus more on potential gains or potential losses when making investment decisions?",
    options: [
      { value: 1, label: "Completely focused on avoiding losses" },
      { value: 2, label: "More focused on safety than gains" },
      { value: 3, label: "Balanced between risk and reward" },
      { value: 4, label: "Mostly focused on maximizing gains" }
    ]
  },
  {
    id: 5,
    text: "Have you ever sold an investment in a panic?",
    options: [
      { value: 1, label: "Yes, multiple times" },
      { value: 2, label: "Yes, once or twice" },
      { value: 3, label: "Rarely — I try to stay disciplined" },
      { value: 4, label: "Never — I stay the course regardless" }
    ]
  },
  {
    id: 6,
    text: "Do you typically stick to your investment plan, or do you change course when the market moves suddenly?",
    options: [
      { value: 1, label: "I often change course or react emotionally" },
      { value: 2, label: "I sometimes adjust my plan" },
      { value: 3, label: "I mostly stay disciplined" },
      { value: 4, label: "I always follow my long-term plan" }
    ]
  },
  {
    id: 7,
    text: "What types of investments have you made in the past?",
    options: [
      { value: 1, label: "Only low-risk (savings, CDs, bonds)" },
      { value: 2, label: "Some moderate-risk (mutual funds, ETFs)" },
      { value: 3, label: "High-risk (stocks, crypto)" },
      { value: 4, label: "Very high-risk or speculative (options, startups, leveraged assets)" }
    ]
  },
  {
    id: 8,
    text: "What percentage of your total net worth is currently invested in the stock market?",
    options: [
      { value: 1, label: "Less than 10%" },
      { value: 2, label: "10–30%" },
      { value: 3, label: "30–60%" },
      { value: 4, label: "Over 60%" }
    ]
  },
  {
    id: 9,
    text: "Do you rely on your investments for short-term needs, or are they primarily long-term?",
    options: [
      { value: 1, label: "Rely heavily on them for short-term needs" },
      { value: 2, label: "Occasionally use investment funds" },
      { value: 3, label: "Mostly long-term focus" },
      { value: 4, label: "Completely long-term; no short-term reliance" }
    ]
  },
  {
    id: 10,
    text: "If you lost 25% of your investment today, how would it impact your lifestyle or financial obligations?",
    options: [
      { value: 1, label: "Severely — it would cause financial hardship" },
      { value: 2, label: "Noticeable impact, but manageable" },
      { value: 3, label: "Minimal impact — I’d adjust spending slightly" },
      { value: 4, label: "No impact — I’d continue as normal" }
    ]
  },
  {
    id: 11,
    text: "What is your investment time horizon?",
    options: [
      { value: 1, label: "1–3 years" },
      { value: 2, label: "3–5 years" },
      { value: 3, label: "5–10 years" },
      { value: 4, label: "10+ years" }
    ]
  },
  {
    id: 12,
    text: "If two investments had the same expected return, but one had twice the volatility, which would you choose?",
    options: [
      { value: 1, label: "The stable, low-volatility one" },
      { value: 2, label: "Probably the stable one, unless the risk is small" },
      { value: 3, label: "Either — depends on the opportunity" },
      { value: 4, label: "The high-volatility one — more excitement and potential" }
    ]
  },
  {
    id: 13,
    text: "You’re offered a guaranteed 5% annual return or a 50/50 chance to earn 15% or 0%. Which do you take?",
    options: [
      { value: 1, label: "Guaranteed 5% — safety first" },
      { value: 2, label: "Likely the 5%, but I’d think about the gamble" },
      { value: 3, label: "Take the 50/50 — I’m comfortable with risk" },
      { value: 4, label: "Definitely the 50/50 — go big or go home" }
    ]
  },
  {
    id: 14,
    text: "Would you prefer a smooth but low-return investment, or a high-return investment with sharp ups and downs?",
    options: [
      { value: 1, label: "Smooth and low-return" },
      { value: 2, label: "Mostly smooth with some volatility" },
      { value: 3, label: "Moderately volatile with higher potential" },
      { value: 4, label: "Highly volatile, high-return" }
    ]
  },
  {
    id: 15,
    text: "What would you do if your retirement account lost 30% in a year due to a market crash?",
    options: [
      { value: 1, label: "Sell to avoid further losses" },
      { value: 2, label: "Wait cautiously for recovery" },
      { value: 3, label: "Hold and consider rebalancing" },
      { value: 4, label: "Buy more while prices are low" }
    ]
  },
  {
    id: 16,
    text: "Do you think it’s more important to take on risk when you’re younger or older?",
    options: [
      { value: 1, label: "Avoid risk at any age" },
      { value: 2, label: "Minimize risk at all times" },
      { value: 3, label: "Take more risk while younger" },
      { value: 4, label: "Take aggressive risks early to maximize growth" }
    ]
  },
  {
    id: 17,
    text: "What is the largest percentage drop in your investment portfolio you could accept?",
    options: [
      { value: 1, label: "I can't tolerate any losses" },
      { value: 2, label: "I prefer to avoid a loss greater than 15%" },
      { value: 3, label: "I'm okay with a 20% loss" },
      { value: 4, label: "I can handle significant drops" }
    ]
  },
  {
    id: 18,
    text: "If you faced sudden job loss two months before a planned luxury vacation, your response would be to",
    options: [
      { value: 1, label: "Cancel the vacation completely" },
      { value: 2, label: "Scale down to a more affordable trip" },
      { value: 3, label: "Proceed with the vacation as planned" },
      { value: 4, label: "Add on more to your vacation" }
    ]
  },
  {
    id: 19,
    text: "If you won $5000, how would you consider using it?",
    options: [
      { value: 1, label: "Keep it as cash" },
      { value: 2, label: "Put it in a high-yield savings account" },
      { value: 3, label: "Invest it in stocks" },
      { value: 4, label: "Gamble it for a chance at a bigger win" }
    ]
  },
  {
    id: 20,
    text: "If your stocks dropped 30% in value, your reaction would be:",
    options: [
      { value: 1, label: "Sell to minimize loss" },
      { value: 2, label: "Hold on and wait for recovery" },
      { value: 3, label: "Invest more to average down" },
      { value: 4, label: "Reevaluate my investment strategy before deciding" }
    ]
  },
  {
    id: 21,
    text: "What is your primary goal of investing?",
    options: [
      { value: 1, label: "Maintain my wealth" },
      { value: 2, label: "Long-term wealth accumulation" },
      { value: 3, label: "Quick profits" },
      { value: 4, label: "Generate regular income or dividends" }
    ]
  },
  {
    id: 22,
    text: "How comfortable are you with investing in high-risk stocks?",
    options: [
      { value: 1, label: "Not comfortable at all" },
      { value: 2, label: "Somewhat comfortable" },
      { value: 3, label: "Very Comfortable" },
      { value: 4, label: "Certain" }
    ]
  },
  {
    id: 23,
    text: "What percentage of your total investments is currently in stocks?",
    options: [
      { value: 1, label: "Below 30%" },
      { value: 2, label: "30–60%" },
      { value: 3, label: "60–80%" },
      { value: 4, label: "Over 80%" }
    ]
  },
  {
    id: 24,
    text: "How do you rate your understanding of investing concepts?",
    options: [
      { value: 1, label: "Not very knowledgeable" },
      { value: 2, label: "Moderately knowledgeable" },
      { value: 3, label: "Very knowledgeable" },
      { value: 4, label: "Expert in investing" }
    ]
  }
];

const RiskSurvey = (props) => {

    const setUserRiskTolerance = props.setUserRiskTolerance;
    const scoreSurvey = (answerList) => {
        const maxScore = currentQuestions.reduce((sum, q) => {
            const maxOption = Math.max(...q.options.map(o => o.value));
            return sum + maxOption;
        }, 0);

        const minScore = currentQuestions.reduce((sum, q) => {
            const minOption = Math.min(...q.options.map(o => o.value));
            return sum + minOption;
        }, 0);

        const rawScore = answerList.reduce((sum, val) => sum + val, 0);
        const normalizedScore = ((rawScore - minScore) / (maxScore - minScore));

        console.log(minScore, maxScore, rawScore, normalizedScore);
        return getRiskClassFromLevel(normalizedScore);
    }
    return (
        <div className="risk-survey-content">
            <Survey
                title="Risk Assessment Survey"
                disclaimer={<ul>
                                <li>This risk assessment survey is for informational purposes only.</li>
                                <li>Your responses are not saved or stored anywhere.</li>
                                <li>The results provided are indicative and should not be considered as professional financial advice.</li>
                                <li>For actual investment decisions, please consult with a qualified financial advisor.</li>
                            </ul>}
                setResult={setUserRiskTolerance}
                scoringFunction={scoreSurvey}
                questions={currentQuestions}
            />

        </div>
    )
}


export default RiskSurvey;
