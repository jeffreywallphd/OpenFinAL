import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const FinancialKnowledgeSurvey = () => {
  const questionSet1 = [
    {
      id: 1,
      questionText: "How would you describe your current knowledge of investing?",
      answerOptions: [
        { answerText: "I'm completely new and don't know basic terms like \"stock\" or \"bond\".", score: 1 },
        { answerText: "I know the basics but haven't invested much.", score: 2 },
        { answerText: "I'm comfortable with concepts like diversification and have some experience.", score: 3 },
        { answerText: "I'm experienced and familiar with advanced topics like options or market analysis.", score: 4 }
      ]
    },
    {
      id: 2,
      questionText: "Have you ever invested in stocks, bonds, or other securities?",
      answerOptions: [
        { answerText: "No, never.", score: 1 },
        { answerText: "Yes, but only through a retirement account like a 401(k).", score: 2 },
        { answerText: "Yes, I've made a few individual investments.", score: 3 },
        { answerText: "Yes, I actively manage a portfolio.", score: 4 }
      ]
    },
    {
      id: 3,
      questionText: "How familiar are you with financial ratios like P/E or Debt-to-Equity?",
      answerOptions: [
        { answerText: "Not at all.", score: 1 },
        { answerText: "I've heard of them but don't understand how to use them.", score: 2 },
        { answerText: "I can interpret them for basic stock analysis.", score: 3 },
        { answerText: "I use them regularly in my investment decisions.", score: 4 }
      ]
    },
    {
      id: 4,
      questionText: "How would you describe your understanding of how taxes affect your investments?",
      answerOptions: [
        { answerText: "I don't really know how investment taxes work.", score: 1 },
        { answerText: "I've heard of capital gains and tax-advantaged accounts, but don't fully understand them.", score: 2 },
        { answerText: "I understand key concepts like short- vs long-term capital gains and tax deferral.", score: 3 },
        { answerText: "I actively consider tax implications (e.g., harvesting losses, asset location) when investing.", score: 4 }
      ]
    },
    {
      id: 5,
      questionText: "What does \"diversification\" mean in investing?",
      answerOptions: [
        { answerText: "Putting all your money in one stock for higher returns.", score: 1 },
        { answerText: "Spreading investments across different assets to reduce risk.", score: 3 },
        { answerText: "Buying only low-risk bonds.", score: 2 },
        { answerText: "I don't know.", score: 1 }
      ]
    }
  ];

  const questionSet2 = [
    {
      id: 1,
      questionText: "If you buy a company's stock, what are you actually doing?",
      answerOptions: [
        { answerText: "You're buying ownership — you own a part of the company.", score: 4 },
        { answerText: "You're letting the company borrow your money.", score: 3 },
        { answerText: "You're putting in money and the company promises to pay you back with extra later.", score: 2 },
        { answerText: "You're on the hook if the company owes money or gets into debt.", score: 1 },
      ],
    },
    {
      id: 2,
      questionText: "Over the past 20 years in the U.S., which investment has usually had the highest average returns?",
      answerOptions: [
        { answerText: "Investing in stocks.", score: 4 },
        { answerText: "Buying bonds.", score: 3 },
        { answerText: "Putting money into precious metals like gold or silver.", score: 2 },
        { answerText: "Keeping cash in a CD or money market account.", score: 1 },
      ],
    },
    {
      id: 3,
      questionText:
        "Over the long run, what's a realistic average yearly return to expect from a well-diversified U.S. stock mutual fund?",
      answerOptions: [
        { answerText: "10%", score: 4 },
        { answerText: "5%", score: 3 },
        { answerText: "15%", score: 2 },
        { answerText: "Over 20%", score: 1 },
      ],
    },
    {
      id: 4,
      questionText: "How would you evaluate whether a stock is overvalued or undervalued?",
      answerOptions: [
        { answerText: "I'd analyze fundamentals, trends, and valuation models like DCF.", score: 4 },
        { answerText: "I'd compare its P/E ratio and other metrics to industry averages.", score: 3 },
        { answerText: "I'd look at the current price compared to past prices.", score: 2 },
        { answerText: "I'm not sure.", score: 1 },
      ],
    },
    {
      id: 5,
      questionText: "What role do index funds play in a portfolio?",
      answerOptions: [
        { answerText: "They offer diversified exposure to specific sectors using underlying securities.", score: 4 },
        { answerText: "They help spread risk by investing in a broad market.", score: 3 },
        { answerText: "They're similar to stocks.", score: 2 },
        { answerText: "I'm not sure.", score: 1 },
      ],
    },
    {
      id: 6,
      questionText: "How do interest rates affect investments?",
      answerOptions: [
        { answerText: "I actively monitor rate trends to adjust my investment strategy.", score: 4 },
        { answerText: "I understand that rising rates can negatively impact bonds and equities.", score: 3 },
        { answerText: "I know they impact the market, but I'm not sure how.", score: 2 },
        { answerText: "I'm not sure.", score: 1 },
      ],
    },
    {
      id: 7,
      questionText: "What does the \"time value of money\" mean?",
      answerOptions: [
        { answerText: "A dollar today is worth more than a dollar in the future due to its earning potential.", score: 4 },
        { answerText: "Inflation and other economic conditions can erode the value of money over time.", score: 3 },
        { answerText: "It refers to how long you can hold cash before investing it.", score: 2 },
        { answerText: "It means future money will always grow at the same rate.", score: 1 },
      ],
    },
    {
      id: 8,
      questionText: "Which kind of bond is considered the safest to invest in?",
      answerOptions: [
        { answerText: "U.S. Treasury bonds", score: 4 },
        { answerText: "Municipal bonds", score: 3 },
        { answerText: "Corporate bonds", score: 2 },
        { answerText: "Unsure", score: 1 },
      ],
    },
    {
      id: 9,
      questionText: "I plan to begin taking money from my investments in…",
      answerOptions: [
        { answerText: "1-2 years", score: 4 },
        { answerText: "3-5 years", score: 3 },
        { answerText: "6-10 years", score: 2 },
        { answerText: "11-15 years", score: 1 },
      ],
    },
    {
      id: 10,
      questionText: "My current and future income sources are…",
      answerOptions: [
        { answerText: "Very Unstable", score: 4 },
        { answerText: "Unstable", score: 3 },
        { answerText: "Somewhat Stable", score: 2 },
        { answerText: "Stable", score: 1 },
      ],
    },
    {
      id: 11,
      questionText: "How would you describe your understanding of how taxes affect your investments?",
      answerOptions: [
        { answerText: "I don't really know how investment taxes work.", score: 1 },
        { answerText: "I've heard of capital gains and tax-advantaged accounts, but don't fully understand them.", score: 2 },
        { answerText: "I understand key concepts like short- vs long-term capital gains and tax deferral.", score: 3 },
        { answerText: "I actively consider tax implications (e.g., harvesting losses, asset location) when investing.", score: 4 },
      ],
    },
    {
      id: 12,
      questionText: "How would you describe your current knowledge of investing?",
      answerOptions: [
        { answerText: "I'm completely new and don't know basic terms like \"stock\" or \"bond\".", score: 1 },
        { answerText: "I know the basics but haven't invested much.", score: 2 },
        { answerText: "I'm comfortable with concepts like diversification and have some experience.", score: 3 },
        { answerText: "I'm experienced and familiar with advanced topics like options or market analysis.", score: 4 },
      ],
    },
    {
      id: 13,
      questionText: "Have you ever invested in stocks, bonds, or other securities?",
      answerOptions: [
        { answerText: "No, never.", score: 1 },
        { answerText: "Yes, but only through a retirement account like a 401(k).", score: 2 },
        { answerText: "Yes, I've made a few individual investments.", score: 3 },
        { answerText: "Yes, I actively manage a portfolio.", score: 4 },
      ],
    },
    {
      id: 14,
      questionText: "What does \"diversification\" mean in investing?",
      answerOptions: [
        { answerText: "Putting all your money in one stock for higher returns.", score: 1 },
        { answerText: "Spreading investments across different assets to reduce risk.", score: 3 },
        { answerText: "Buying only low-risk bonds.", score: 2 },
        { answerText: "I don't know.", score: 1 },
      ],
    },
    {
      id: 15,
      questionText: "How familiar are you with financial ratios like P/E or Debt-to-Equity?",
      answerOptions: [
        { answerText: "Not at all.", score: 1 },
        { answerText: "I've heard of them but don't understand how to use them.", score: 2 },
        { answerText: "I can interpret them for basic stock analysis.", score: 3 },
        { answerText: "I use them regularly in my investment decisions.", score: 4 },
      ],
    },
  ];

  const questionSet3 = [
    {
      id: 1,
      questionText: "If you buy a company's stock, what are you actually doing?",
      answerOptions: [
        { answerText: "You're buying ownership - you own a part of the company.", score: 4 },
        { answerText: "You're letting the company borrow your money.", score: 3 },
        { answerText: "You're putting in money and the company promises to pay you back with extra later.", score: 2 },
        { answerText: "You're on the hook if the company owes money or goes into debt.", score: 1 }
      ]
    },
    {
      id: 2,
      questionText: "Over the past 20 years in the U.S., which investment has usually had the highest average returns?",
      answerOptions: [
        { answerText: "Investing in stocks.", score: 4 },
        { answerText: "Buying bonds.", score: 3 },
        { answerText: "Putting money into precious metals like gold or silver.", score: 2 },
        { answerText: "Keeping cash in a CD or money market account.", score: 1 }
      ]
    },
    {
      id: 3,
      questionText: "Over the long run, what's a realistic average yearly return to expect from a well-diversified U.S. stock mutual fund?",
      answerOptions: [
        { answerText: "10%", score: 4 },
        { answerText: "5%", score: 3 },
        { answerText: "15%", score: 2 },
        { answerText: "Over 20%", score: 1 }
      ]
    },
    {
      id: 4,
      questionText: "How would you evaluate whether a stock is overvalued or undervalued?",
      answerOptions: [
        { answerText: "I'd analyze fundamentals, trends, and valuation models like DCF.", score: 4 },
        { answerText: "I'd compare its P/E ratio and other metrics to industry averages.", score: 3 },
        { answerText: "I'd look at the current price compared to past prices.", score: 2 },
        { answerText: "I'm not sure.", score: 1 }
      ]
    },
    {
      id: 5,
      questionText: "What role do index funds play in a portfolio?",
      answerOptions: [
        { answerText: "They offer diversified exposure to specific sectors using underlying securities.", score: 4 },
        { answerText: "They help spread risk by investing in a broad market.", score: 3 },
        { answerText: "They're similar to stocks.", score: 2 },
        { answerText: "I'm not sure.", score: 1 }
      ]
    },
    {
      id: 6,
      questionText: "How do interest rates affect investments?",
      answerOptions: [
        { answerText: "I actively monitor rate trends to adjust my investment strategy.", score: 4 },
        { answerText: "I understand that rising rates can negatively impact bonds and equities.", score: 3 },
        { answerText: "I know they impact the market, but I'm not sure how.", score: 2 },
        { answerText: "I'm not sure.", score: 1 }
      ]
    },
    {
      id: 7,
      questionText: "What does the \"time value of money\" mean?",
      answerOptions: [
        { answerText: "A dollar today is worth more than a dollar in the future due to its earning potential.", score: 4 },
        { answerText: "Inflation and other economic conditions can erode the value of money over time.", score: 3 },
        { answerText: "It refers to how long you can hold cash before investing it.", score: 2 },
        { answerText: "It means future money will always grow at the same rate.", score: 1 }
      ]
    },
    {
      id: 8,
      questionText: "Which kind of bond is considered the safest to invest in?",
      answerOptions: [
        { answerText: "U.S. Treasury bonds", score: 4 },
        { answerText: "Municipal bonds", score: 3 },
        { answerText: "Corporate bonds", score: 2 },
        { answerText: "Unsure", score: 1 }
      ]
    },
    {
      id: 9,
      questionText: "What does diversification mean in investing?",
      answerOptions: [
        { answerText: "Putting all your money in one stock for higher returns.", score: 1 },
        { answerText: "Spreading investments across different assets to reduce risk.", score: 2 },
        { answerText: "Buying only low-risk bonds.", score: 3 },
        { answerText: "I don't know.", score: 4 }
      ]
    },
    {
      id: 10,
      questionText: "What do financial ratios like P/E (Price-to-Earnings) or Debt-to-Equity help investors evaluate?",
      answerOptions: [
        { answerText: "A company's profitability and financial health.", score: 4 },
        { answerText: "The number of shares a company has issued.", score: 3 },
        { answerText: "How much cash the company holds.", score: 2 },
        { answerText: "The company's market and advertising expenses.", score: 1 }
      ]
    },
    {
      id: 11,
      questionText: "How would you describe your understanding of how taxes affect your investments?",
      answerOptions: [
        { answerText: "I actively consider tax implications (e.g., harvesting losses, asset location) when investing.", score: 4 },
        { answerText: "I've heard of capital gains and tax-advantage accounts, but don't fully understand them.", score: 2 },
        { answerText: "I understand key concepts like short- vs long-term capital gains and tax deferral.", score: 3 },
        { answerText: "I don't really know how investment taxes work.", score: 1 }
      ]
    },
    {
      id: 12,
      questionText: "What is the main difference between a Roth IRA and a Traditional IRA?",
      answerOptions: [
        { answerText: "Roth IRAs use after-tax contributions making withdrawals tax-free in retirement.", score: 4 },
        { answerText: "Traditional IRAs use after-tax contributions, so withdrawals are tax-free.", score: 3 },
        { answerText: "Roth IRAs are only for high-income earners.", score: 2 },
        { answerText: "I'm not sure.", score: 1 }
      ]
    },
    {
      id: 13,
      questionText: "What is capital gain?",
      answerOptions: [
        { answerText: "The profit realized when an asset is sold for more than its purchase price.", score: 4 },
        { answerText: "The interest earned from a savings or bond investment.", score: 3 },
        { answerText: "The regular income paid by a company to shareholders.", score: 2 },
        { answerText: "The total revenue a company earns during the year.", score: 1 }
      ]
    },
    {
      id: 14,
      questionText: "Which of the following best describes the term liquidity?",
      answerOptions: [
        { answerText: "How easily an asset can be converted to cash without losing value.", score: 4 },
        { answerText: "The total amount of debt a company owns.", score: 3 },
        { answerText: "The company's ability to generate profit over time.", score: 2 },
        { answerText: "The difference between revenue and expenses.", score: 1 }
      ]
    },
    {
      id: 15,
      questionText: "Why might a taxpayer choose itemized deductions instead of the standard deduction?",
      answerOptions: [
        { answerText: "Their deductible expenses exceed the standard deduction amount.", score: 4 },
        { answerText: "It guarantees a larger tax refund.", score: 3 },
        { answerText: "It eliminates the need to file state taxes.", score: 2 },
        { answerText: "It's required for all high-income taxpayers.", score: 1 }
      ]
    },
    {
      id: 16,
      questionText: "When you purchase a company's bond, what does that mean?",
      answerOptions: [
        { answerText: "You've loaned money to the company.", score: 4 },
        { answerText: "You've become a partial owner of the company.", score: 3 },
        { answerText: "You get to vote on company decisions like shareholders do.", score: 2 },
        { answerText: "You're responsible for the company's debts.", score: 1 }
      ]
    },
    {
      id: 17,
      questionText: "Typically, when interest rates drop, what happens to bond prices?",
      answerOptions: [
        { answerText: "Go up", score: 4 },
        { answerText: "Are not affected", score: 3 },
        { answerText: "Go down", score: 2 },
        { answerText: "Don't know/Not sure", score: 1 }
      ]
    },
    {
      id: 18,
      questionText: "Which organization protects investors if their brokerage firm fails, but does not insure against losses from stock market declines?",
      answerOptions: [
        { answerText: "SIPC (Securities Investor Protection Corporation)", score: 4 },
        { answerText: "SEC (Securities and Exchange Commission)", score: 3 },
        { answerText: "FINRA (Financial Industry Regulation Authority)", score: 2 },
        { answerText: "FDIC (Federal Deposit Insurance Corporation)", score: 1 }
      ]
    },
    {
      id: 19,
      questionText: "In general, how do risk and return relate to each other in investing?",
      answerOptions: [
        { answerText: "Riskier investments usually offer higher potential returns over time.", score: 4 },
        { answerText: "Riskier investments usually offer lower returns over time.", score: 3 },
        { answerText: "Risk level has no effect on investment returns.", score: 2 },
        { answerText: "Not sure / Don't know.", score: 1 }
      ]
    },
    {
      id: 20,
      questionText: "Are hedge funds required to follow the same rules and regulations as mutual funds?",
      answerOptions: [
        { answerText: "No, hedge funds operate with fewer regulations than mutual funds.", score: 4 },
        { answerText: "Yes, they follow the exact same regulations.", score: 3 },
        { answerText: "They are more heavily regulated than mutual funds.", score: 2 },
        { answerText: "Not sure / Don't know.", score: 1 }
      ]
    },
    {
      id: 21,
      questionText: "Why do many municipal bonds typically offer lower yields than other government bonds?",
      answerOptions: [
        { answerText: "Because the interest earned on municipal bonds is often exempt from federal (and sometimes state) taxes.", score: 4 },
        { answerText: "Because municipal bonds are riskier investments.", score: 3 },
        { answerText: "Because municipal bonds are not backed by any government entity.", score: 2 },
        { answerText: "Not sure / Don't know.", score: 1 }
      ]
    },
    {
      id: 22,
      questionText: "If a company goes bankrupt, which type of investment is most likely to lose nearly all its value?",
      answerOptions: [
        { answerText: "Common stock", score: 4 },
        { answerText: "Corporate bonds", score: 3 },
        { answerText: "Preferred stock", score: 2 },
        { answerText: "Not sure / Don't know", score: 1 }
      ]
    },
    {
      id: 23,
      questionText: "What does \"compound interest\" mean?",
      answerOptions: [
        { answerText: "Earning interest on both your original investment and on the interest it already earned.", score: 4 },
        { answerText: "Interest that is only calculated on the initial deposit.", score: 3 },
        { answerText: "Interest that decreases over time.", score: 2 },
        { answerText: "Not sure / Don't know.", score: 1 }
      ]
    },
    {
      id: 24,
      questionText: "What does a mutual fund do?",
      answerOptions: [
        { answerText: "Pools money from many investors to buy a diversified portfolio of securities.", score: 4 },
        { answerText: "Guarantees a fixed return.", score: 3 },
        { answerText: "Only invests in government bonds.", score: 2 },
        { answerText: "Not sure / Don't know.", score: 1 }
      ]
    },
    {
      id: 25,
      questionText: "What is dollar-cost averaging (DCA)?",
      answerOptions: [
        { answerText: "Investing a fixed amount of money at regular intervals regardless of market conditions.", score: 4 },
        { answerText: "Buying more shares when prices rise to maximize returns.", score: 3 },
        { answerText: "Timing investments to buy only when the market drops.", score: 2 },
        { answerText: "Investing all your money at once for faster growth.", score: 1 }
      ]
    },
    {
      id: 26,
      questionText: "What is the main purpose of asset allocation in an investment strategy?",
      answerOptions: [
        { answerText: "Balancing risk and return by spreading investments across different asset classes.", score: 4 },
        { answerText: "Maximizing short-term profit through concentrated investments.", score: 3 },
        { answerText: "Avoiding stocks entirely by focusing only on safe assets.", score: 2 },
        { answerText: "Randomly distributing investments across any available options.", score: 1 }
      ]
    },
    {
      id: 27,
      questionText: "What is the difference between a stock's market capitalization and its share price?",
      answerOptions: [
        { answerText: "Market cap is the total value of all shares, while share price is the cost of one share.", score: 4 },
        { answerText: "Market cap refers only to company profits, while share price reflects investor demand.", score: 3 },
        { answerText: "They are the same measure expressed differently.", score: 2 },
        { answerText: "Not sure / Don't know.", score: 1 }
      ]
    },
    {
      id: 28,
      questionText: "What is a dividend reinvestment plan (DRIP)?",
      answerOptions: [
        { answerText: "A program that automatically uses dividends to purchase more shares of the same stock.", score: 4 },
        { answerText: "A plan that pays out dividends only once per year.", score: 3 },
        { answerText: "A savings account for dividend income.", score: 2 },
        { answerText: "Not sure / Don't know.", score: 1 }
      ]
    },
    {
      id: 29,
      questionText: "What does \"beta\" mean in relation to a stock or portfolio?",
      answerOptions: [
        { answerText: "How much a stock's price moves compared to the overall market.", score: 4 },
        { answerText: "The company's earnings growth rate.", score: 3 },
        { answerText: "The average dividend yield of the stock.", score: 2 },
        { answerText: "Not sure / Don't know.", score: 1 }
      ]
    },
    {
      id: 30,
      questionText: "Why might an investor use a stop-loss order?",
      answerOptions: [
        { answerText: "To automatically sell a security if its price falls to a certain level, limiting potential losses.", score: 4 },
        { answerText: "To guarantee a dividend payout.", score: 3 },
        { answerText: "To automatically buy more shares when prices drop.", score: 2 },
        { answerText: "Not sure / Don't know.", score: 1 }
      ]
    }
  ];

  const [step, setStep] = useState("begin");
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showNext, setShowNext] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const questionSet = questionSet1; // To change question set for testing purposes, change this variable
  const navigate = useNavigate();
  const location = useLocation();

  const handleRetake = () => {
    setStep("begin");
    setAnswers([]);
    setResult(null);
    setCurrentQuestion(0);
    setShowNext(false);
    setShowSubmit(false);
  }

  const handleAnswer = (index, choice) => {
    const newAnswers = [...answers];
    newAnswers[index] = choice.answerText;
    setAnswers(newAnswers);

    if (index < questionSet.length - 1) {
      setShowNext(true);
      setShowSubmit(false);
    } else {
      setShowNext(false);
      setShowSubmit(true);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questionSet.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowNext(false);
      setShowSubmit(false);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowNext(true);
      setShowSubmit(false);
    }
  };

  // --- SAVE SURVEY RESULT TO SQLITE ---
async function saveSurveyLevelToDB(userId, level) {
  try {
    if (!window.database || !window.database.SQLiteUpdate) {
      console.error("Database API is not available.");
      return;
    }

    // Only update the level column
    await window.database.SQLiteUpdate({
      query: `UPDATE User SET overallKnowledgeLevel = ? WHERE id = ?`,
      parameters: [level, userId]
    });

    console.log("Survey level saved successfully:", level);
  } catch (err) {
    console.error("Error saving survey level:", err);
  }
}


  const scoreCalculation = (answers) => {
    let score = 0;

    answers.forEach((answerText, index) => {
      if (!answerText) return;
      const question = questionSet[index];
      const selectedAnswer = question.answerOptions.find(
        (opt) => opt.answerText === answerText
      );
      if (selectedAnswer && selectedAnswer.score)
        score += selectedAnswer.score;
    });

    let level = "";
    if (score <= 20) level = "Beginner";
    else if (score <= 40) level = "Intermediate";
    else level = "Advanced";
    
  const learningPaths = {
  Beginner: "Start with basic investing concepts, risk and return fundamentals.",
  Intermediate: "Explore portfolio diversification, bonds, and mutual funds.",
  Advanced: "Focus on advanced topics like valuation models, risk analytics, and trading strategies."
};

let learningPath = learningPaths[level] || learningPaths.Advanced;

    setStep("results");
    setResult({ score, level, learningPath });

    // --- SAVE TO DB ---
  const userId = location.state?.userId; // get userId from location.state
  if (userId) {
    saveSurveyLevelToDB(userId, level);
  } else {
    console.error("User ID not found. Cannot save survey level.");
  }
};
  

  if (step === "begin") {
    return (
      <div className="disclaimer-container">
        <div className="disclaimer-content">
          <h2>Investment Knowledge Assessment</h2>
          <div className="disclaimer-text">
            <ul>
              <h3>Important Notice</h3>
              <li>This assessment is for informational purposes only.</li>
              <li>Your responses are not saved or stored anywhere.</li>
              <li>The results provided are indicative and should not be considered as professional financial advice.</li>
              <li>For actual investment decisions, please consult with a qualified financial advisor.</li>
            </ul>
          </div>
          <button className="agree-button" onClick={() => setStep("quiz")}>Start Assessment</button>
        </div>
      </div >
    );
  }

  if (step === "results" && result) {
    return (
      <div className="disclaimer-container">
        <div className="disclaimer-content">
          <h2 className="result-title">Your Investment Knowledge Result</h2>
          <div className="result-details">
            <p>
              <strong>Score: </strong>{result.score}
            </p>
            <p>
              <strong>Level:</strong>{" "}
              <span
                className={`level-tag ${result.level === "Beginner"
                  ? "beginner"
                  : result.level === "Intermediate"
                    ? "intermediate"
                    : "advanced"
                  }`}
              >
                {result.level}
              </span>
            </p>
            <p><strong>Recommended Learning Path: </strong>{result.learningPath}</p>
          </div>
        </div>
        <button className="retake-btn" onClick={() => handleRetake()}>
          Retake Assessment
        </button>
      </div>
    );
  }

  const question = questionSet[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  return (
    <div className="disclaimer-container">
      <div className="survey-container">
        <div className="question-container">
          <h2>Question {currentQuestion + 1}</h2>
          <p class="question-text">{question.questionText}</p>

          <div className="options-container">
            {question.answerOptions.map((choice, idx) => (
              <label
                key={idx}
                className={`option-button ${selectedAnswer === choice.answerText ? "selected" : ""
                  }`}>
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={choice.answerText}
                  checked={selectedAnswer === choice.answerText}
                  onChange={() => handleAnswer(currentQuestion, choice)}
                />
                {choice.answerText}
              </label>
            ))}
          </div>
        </div>

        <div className="navigation-container">
          {currentQuestion > 0 && (
            <button className="back-button" onClick={prevQuestion}>
              Back
            </button>
          )}
          {showNext && (
            <button className="next-button" onClick={nextQuestion}>
              Next
            </button>
          )}
          {showSubmit && (
            <button className="submit-button" onClick={() => scoreCalculation(answers)}>
              Submit Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialKnowledgeSurvey;
