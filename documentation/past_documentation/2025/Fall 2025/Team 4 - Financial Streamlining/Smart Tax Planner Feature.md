# Overview

**Feature**: **Smart Tax Planner**   
**Objective: To help users understand, forecast, and optimize their investing decisions based on tax considerations.**   
---

**Integrated Components**

1. IRS Tax Tables: Income brackets & capital gains brackets, NIIT & AMT thresholds  
2. Various Alerts of Tax Triggers: Contribution limits, bracket encroaching  
3. Optimization Capabilities: Based on set information  
4. Simulation: Able to run “What If?” questions at users request  
5. User Input Interface: Editable income fields, manual investment activity fields (or importable), contribution fields  
6. Summarization Capabilities: Standardized format  
   

# Core Functionality

**User Activity**  
**Software Activity**

| Feature Component | Description |
| ----- | ----- |
| User Income Input | User enters annual income and updates periodically |
| Investment Entry Tracking | User logs investment activities (buy/sell) |
| Real-Time Bracket Identification | Software identifies user’s current tax bracket |
| Bracket Shift Simulation | Software notifies of any potential bracket change based on user activity |
| Scenario Modeling | Simulations by user |
| Capital Gains Optimization | Software classifies short and long-term gains & calculates tax for each class |
| Harvesting Alerts | Software notifies when a loss can be harvested to offset gains |
| Asset Location Guidance | Software recommends which accounts to hold investments in |
| Estimated Tax Impact | Software shows estimated tax liability based on user’s current financial position |
| End-of-Year Tax Summary | Software creates a report/visualization of yearly activity |

# Flow Diagram

| Step | User Action | System Process | Feedback to User |
| ----- | ----- | ----- | ----- |
| 1 | Inputs income sources | Aggregates income and sets base tax bracket  | Shows current tax bracket |
| 2 | Logs investment buy | Creates tax lot and begins holding period | Confirms whether asset will become long-term and when |
| 3 | Logs investment sell | Calculates capital gain (LT/ST) | Estimates tax owed and income change |
| 4 | Enters dividend/interest income | Categorizes as qualified/non-qualified | Adjusts income aggregation and re-evaluates tax bracket |
| 5 | Runs simulation | Runs scenario engine | Sees current and projected taxes based on simulated activity |
| 6 | Portfolio contains losses | Checks for eligible gains to offset | Sends suggested action (Tax-loss harvesting or hold) |
| 7 | Income nears next bracket | Compares brackets | Sends warning |
| 8 | Contributes to 401k or IRA | Adjusts taxable income | Shows tax savings & re-evaluates bracket |
| 9 | Runs optimizer | Runs optimization for asset location | Suggests best location |
| 10 | Year End | Summarizes user activity for year in generated report | Viewable report |

# Logic

| Filing Status | Income Range ($) | Tax Bracket (B) | Estimated Tax (T) | Notes / Logic |
| ----- | ----- | ----- | ----- | ----- |
| Single | 0 – 11,600 | 10% | T \= 0.10 × income | Base bracket for single filers |
| Single | 11,601 – 47,150 | 12% | T \= 1,160 \+ 0.12 × (income – 11,600) | Adds prior bracket tax; next marginal tier |
| Single | 47,151 – 100,525 | 22% | T \= 5,426 \+ 0.22 × (income – 47,150) | Mid-income bracket; cumulative calculation |
| Single | 100,526 – 191,950 | 24% | T \= 17,168.50 \+ 0.24 × (income – 100,525) | Higher middle-income tier |
| Single | 191,951 – 243,725 | 32% | T \= 39,110.50 \+ 0.32 × (income – 191,950) | Upper-middle range for single filers |
| Single | 243,726 – 609,350 | 35% | T \= 55,678.50 \+ 0.35 × (income – 243,725) | Near-top bracket; elevated income level |
| Single | Over 609,350 | 37% | T \= 183,647.25 \+ 0.37 × (income – 609,350) | Top marginal rate; highest bracket |
| Married Filing Jointly (MFJ) | 0 – 23,200 | 10% | T \= 0.10 × income | Base bracket for MFJ filers |
| Married Filing Jointly (MFJ) | 23,201 – 94,300 | 12% | T \= 2,320 \+ 0.12 × (income – 23,200) | Next marginal bracket; adds tax from prior bracket |
| Married Filing Jointly (MFJ) | 94,301 – 201,050 | 22% | T \= 10,852 \+ 0.22 × (income – 94,300) | Mid-range bracket; includes accumulated prior tax |
| Married Filing Jointly (MFJ) | 201,051 – 383,900 | 24% | T \= 34,337 \+ 0.24 × (income – 201,050) | Upper-middle bracket; applies higher marginal rate |
| Married Filing Jointly (MFJ) | 383,901 – 487,450 | 32% | T \= 78,221 \+ 0.32 × (income – 383,900) | Higher income range; increased marginal rate |
| Married Filing Jointly (MFJ) | 487,451 – 731,200 | 35% | T \= 111,357 \+ 0.35 × (income – 487,450) | Near-top bracket; includes prior tax accumulations |
| Married Filing Jointly (MFJ) | Over 731,200 | 37% | T \= 196,669.50 \+ 0.37 × (income – 731,200) | Top marginal rate; highest income level |
| Married Filing Separately (MFS) | 0 – 11,600 | 10% | T \= 0.10 × income | Base bracket for MFS filers |
| Married Filing Separately (MFS) | 11,601 – 47,150 | 12% | T \= 1,160 \+ 0.12 × (income – 11,600) | Adds tax from prior bracket |
| Married Filing Separately (MFS) | 47,151 – 100,525 | 22% | T \= 5,426 \+ 0.22 × (income – 47,150) | Mid-level bracket; cumulative from prior |
| Married Filing Separately (MFS) | 100,526 – 191,950 | 24% | T \= 17,168.50 \+ 0.24 × (income – 100,525) | Higher marginal rate tier |
| Married Filing Separately (MFS) | 191,951 – 243,725 | 32% | T \= 39,110.50 \+ 0.32 × (income – 191,950) | Upper-middle range for MFS |
| Married Filing Separately (MFS) | 243,726 – 365,600 | 35% | T \= 55,678.50 \+ 0.35 × (income – 243,725) | Near-top income bracket |
| Married Filing Separately (MFS) | Over 365,600 | 37% | T \= 98,334.75 \+ 0.37 × (income – 365,600) | Top marginal rate; highest income level |
| Head of Household (HoH) | 0 – 16,550 | 10% | T \= 0.10 × income | Base bracket for HoH filers |
| Head of Household (HoH) | 16,551 – 63,100 | 12% | T \= 1,655 \+ 0.12 × (income – 16,550) | Adds prior bracket tax; next marginal tier |
| Head of Household (HoH) | 63,101 – 100,500 | 22% | T \= 7,241 \+ 0.22 × (income – 63,100) | Mid-range bracket; cumulative calculation |
| Head of Household (HoH) | 100,501 – 191,950 | 24% | T \= 15,469 \+ 0.24 × (income – 100,500) | Higher middle-income tier |
| Head of Household (HoH) | 191,951 – 243,700 | 32% | T \= 37,417 \+ 0.32 × (income – 191,950) | Upper-middle range for HoH |
| Head of Household (HoH) | 243,701 – 609,350 | 35% | T \= 53,981 \+ 0.35 × (income – 243,700) | Near-top bracket; elevated income level |
| Head of Household (HoH) | Over 609,350 | 37% | T \= 180,766.50 \+ 0.37 × (income – 609,350) | Top marginal rate; highest bracket |
| Qualifying Widow(er) (QW) | 0 – 23,200 | 10% | T \= 0.10 × income | Base bracket for QW filers (same as MFJ) |
| Qualifying Widow(er) (QW) | 23,201 – 94,300 | 12% | T \= 2,320 \+ 0.12 × (income – 23,200) | Adds prior bracket tax; next marginal tier |
| Qualifying Widow(er) (QW) | 94,301 – 201,050 | 22% | T \= 10,852 \+ 0.22 × (income – 94,300) | Mid-income bracket; cumulative calculation |
| Qualifying Widow(er) (QW) | 201,051 – 383,900 | 24% | T \= 34,337 \+ 0.24 × (income – 201,050) | Higher middle-income tier |
| Qualifying Widow(er) (QW) | 383,901 – 487,450 | 32% | T \= 78,221 \+ 0.32 × (income – 383,900) | Upper-middle range for QW filers |
| Qualifying Widow(er) (QW) | 487,451 – 731,200 | 35% | T \= 111,357 \+ 0.35 × (income – 487,450) | Near-top bracket; elevated income level |
| Qualifying Widow(er) (QW) | Over 731,200 | 37% | T \= 196,669.50 \+ 0.37 × (income – 731,200) | Top marginal rate; highest bracket |

## 

## Pseudocode

SINGLE STATUS  
  IF filing\_status \== "Single" THEN  
      IF taxable\_income \<= 11,600 THEN  
          B \= 10%  
          T \= 0.10 \* taxable\_income  
      ELSE IF taxable\_income \<= 47,150 THEN  
          B \= 12%  
          T \= 1,160 \+ 0.12 \* (taxable\_income \- 11,600)  
      ELSE IF taxable\_income \<= 100,525 THEN  
          B \= 22%  
          T \= 5,426 \+ 0.22 \* (taxable\_income \- 47,150)  
      ELSE IF taxable\_income \<= 191,950 THEN  
          B \= 24%  
          T \= 17,168.50 \+ 0.24 \* (taxable\_income \- 100,525)  
      ELSE IF taxable\_income \<= 243,725 THEN  
          B \= 32%  
          T \= 39,110.50 \+ 0.32 \* (taxable\_income \- 191,950)  
      ELSE IF taxable\_income \<= 609,350 THEN  
          B \= 35%  
          T \= 55,678.50 \+ 0.35 \* (taxable\_income \- 243,725)  
      ELSE  
          B \= 37%  
          T \= 183,647.25 \+ 0.37 \* (taxable\_income \- 609,350)  
      END IF

MFJ or WIDOW(ER) STATUS  
  ELSE IF filing\_status \== "Married Filing Jointly" OR filing\_status \== "Qualifying Widow(er)" THEN  
      IF taxable\_income \<= 23,200 THEN  
          B \= 10%  
          T \= 0.10 \* taxable\_income  
      ELSE IF taxable\_income \<= 94,300 THEN  
          B \= 12%  
          T \= 2,320 \+ 0.12 \* (taxable\_income \- 23,200)  
      ELSE IF taxable\_income \<= 201,050 THEN  
          B \= 22%  
          T \= 10,852 \+ 0.22 \* (taxable\_income \- 94,300)  
      ELSE IF taxable\_income \<= 383,900 THEN  
          B \= 24%  
          T \= 34,337 \+ 0.24 \* (taxable\_income \- 201,050)  
      ELSE IF taxable\_income \<= 487,450 THEN  
          B \= 32%  
          T \= 78,221 \+ 0.32 \* (taxable\_income \- 383,900)  
      ELSE IF taxable\_income \<= 731,200 THEN  
          B \= 35%  
          T \= 111,357 \+ 0.35 \* (taxable\_income \- 487,450)  
      ELSE  
          B \= 37%  
          T \= 196,669.50 \+ 0.37 \* (taxable\_income \- 731,200)  
      END IF

MFS STATUS  
  ELSE IF filing\_status \== "Married Filing Separately" THEN  
      IF taxable\_income \<= 11,600 THEN  
          B \= 10%  
          T \= 0.10 \* taxable\_income  
      ELSE IF taxable\_income \<= 47,150 THEN  
          B \= 12%  
          T \= 1,160 \+ 0.12 \* (taxable\_income \- 11,600)  
      ELSE IF taxable\_income \<= 100,525 THEN  
          B \= 22%  
          T \= 5,426 \+ 0.22 \* (taxable\_income \- 47,150)  
      ELSE IF taxable\_income \<= 191,950 THEN  
          B \= 24%  
          T \= 17,168.50 \+ 0.24 \* (taxable\_income \- 100,525)  
      ELSE IF taxable\_income \<= 243,725 THEN  
          B \= 32%  
          T \= 39,110.50 \+ 0.32 \* (taxable\_income \- 191,950)  
      ELSE IF taxable\_income \<= 365,600 THEN  
          B \= 35%  
          T \= 55,678.50 \+ 0.35 \* (taxable\_income \- 243,725)  
      ELSE  
          B \= 37%  
          T \= 98,334.75 \+ 0.37 \* (taxable\_income \- 365,600)  
      END IF

HOH STATUS  
  ELSE IF filing\_status \== "Head of Household" THEN  
      IF taxable\_income \<= 16,550 THEN  
          B \= 10%  
          T \= 0.10 \* taxable\_income  
      ELSE IF taxable\_income \<= 63,100 THEN  
          B \= 12%  
          T \= 1,655 \+ 0.12 \* (taxable\_income \- 16,550)  
      ELSE IF taxable\_income \<= 100,500 THEN  
          B \= 22%  
          T \= 7,241 \+ 0.22 \* (taxable\_income \- 63,100)  
      ELSE IF taxable\_income \<= 191,950 THEN  
          B \= 24%  
          T \= 15,469 \+ 0.24 \* (taxable\_income \- 100,500)  
      ELSE IF taxable\_income \<= 243,700 THEN  
          B \= 32%  
          T \= 37,417 \+ 0.32 \* (taxable\_income \- 191,950)  
      ELSE IF taxable\_income \<= 609,350 THEN  
          B \= 35%  
          T \= 53,981 \+ 0.35 \* (taxable\_income \- 243,700)  
      ELSE  
          B \= 37%  
          T \= 180,766.50 \+ 0.37 \* (taxable\_income \- 609,350)  
      END IF  
  END IF

  OUTPUT "Tax Bracket: ", B  
  OUTPUT "Estimated Tax: ", T

# Filing Status 

| Option | Label | Filing Status Code | Logic Connection |
| :---- | :---- | :---- | :---- |
| A | I am not married | SINGLE | Routes to “Single” tax bracket logic |
| B | I am married and we plan to file taxes together | MFJ | Routes to “Married Filing Jointly” tax bracket logic |
| C | I am married, but we plan to file taxes separately | MFS | Routes to “Married Filing Separately” tax bracket logic |
| D | I am unmarried, but I financially support a child or another dependent | HOH | Routes to “Head of Household” tax bracket logic |
| E | I am a widow(er) with a dependent child and my spouse passed away in the last two years | QW | Routes to “Qualifying Widow(er)” tax bracket logic |
| F | I am not sure | UNKNOWN | Prompts guidance tool to help user determine correct status |

## Pseudocode

IF filing\_status\_selection \== "A" THEN filing\_status \= "Single"  
ELSE IF filing\_status\_selection \== "B" THEN filing\_status \= "Married Filing Jointly"  
ELSE IF filing\_status\_selection \== "C" THEN filing\_status \= "Married Filing Separately"  
ELSE IF filing\_status\_selection \== "D" THEN filing\_status \= "Head of Household"  
ELSE IF filing\_status\_selection \== "E" THEN filing\_status \= "Qualifying Widow(er)"  
ELSE  
    filing\_status \= "Unknown"  
    PROMPT user to review IRS guidance link or smart helper suggestion  
END IF

# Income

| Income Type | Input Label | Variable Name | Notes / Logic Use |
| ----- | ----- | ----- | ----- |
| Salary & Wages | Salary & Wages (including tips, commissions, self-employment income) | income\_salary | Forms the base for taxable earned income |
| Interest | Interest Income | income\_interest | Used to categorize ordinary income; may trigger NIIT |
| Dividends | Dividend Income | income\_dividends | Split later into qualified vs non-qualified |
| Passive Income | Passive Income (rental income, royalties, etc.) | income\_passive | Subject to ordinary tax or passive loss rules |
| Capital Gains | Capital Gains (from sale of investments) | income\_capital\_gains | Routed through short-term or long-term logic |
| Retirement Income | IRA / Pension / Social Security Income | income\_retirement | Applies special taxation logic |
| Other | Other income (alimony received, gambling winnings, etc.) | income\_other | Aggregated into adjusted gross income |

## 

## Pseudocode

total\_income \= income\_salary \+ income\_interest \+ income\_dividends \+   
               income\_passive \+ income\_capital\_gains \+ income\_retirement \+ income\_other

SET taxable\_income \= total\_income \- adjustments \- deductions

CALL TaxBracketLogic(filing\_status, taxable\_income)

# Capital Gains

| Holding Period | Filing Status | Income Range ($) | Capital Gains Rate (B) | Estimated Tax (T) | Notes / Logic |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Short-Term (\<1 yr) | All | Any | Ordinary income rate | T \= B × gains | Taxed as ordinary income |
| Long-Term (≥1 yr) | Single | 0 – 44,625 | 0% | T \= 0 × gains \= 0 | Base long-term rate for low-income taxpayers |
| Long-Term (≥1 yr) | Single | 44,626 – 492,300 | 15% | T \= 6,693.75 \+ 0.15 × (gains – 44,625) | Includes prior bracket tax |
| Long-Term (≥1 yr) | Single | Over 492,300 | 20% | T \= 72,146.25 \+ 0.20 × (gains – 492,300) | Top rate for high-income taxpayers |
| Long-Term (≥1 yr) | MFJ / QW | 0 – 89,250 | 0% | T \= 0 × gains \= 0 | Base rate for joint filers |
| Long-Term (≥1 yr) | MFJ / QW | 89,251 – 553,850 | 15% | T \= 13,387.50 \+ 0.15 × (gains – 89,250) | Mid-level bracket |
| Long-Term (≥1 yr) | MFJ / QW | Over 553,850 | 20% | T \= 79,387.50 \+ 0.20 × (gains – 553,850) | Top bracket |
| Long-Term (≥1 yr) | MFS | 0 – 44,625 | 0% | T \= 0 × gains \= 0 | Base rate |
| Long-Term (≥1 yr) | MFS | 44,626 – 276,900 | 15% | T \= 6,693.75 \+ 0.15 × (gains – 44,625) | Mid-level bracket |
| Long-Term (≥1 yr) | MFS | Over 276,900 | 20% | T \= 39,427.50 \+ 0.20 × (gains – 276,900) | Top bracket |
| Long-Term (≥1 yr) | HOH | 0 – 59,750 | 0% | T \= 0 × gains \= 0 | Base rate for HOH |
| Long-Term (≥1 yr) | HOH | 59,751 – 523,050 | 15% | T \= 8,962.50 \+ 0.15 × (gains – 59,750) | Mid-level bracket |
| Long-Term (≥1 yr) | HOH | Over 523,050 | 20% | T \= 74,797.50 \+ 0.20 × (gains – 523,050) | Top bracket |

## Pseudocode

FUNCTION CalculateCapitalGainsTax(filing\_status, gains\_amount, holding\_period)  
    
  IF holding\_period \< 1 year THEN  
      \# Short-term gains taxed at ordinary income rate  
      T \= CalculateOrdinaryTax(filing\_status, gains\_amount)  
      RETURN T  
    
  ELSE  
      \# Long-term gains  
      IF filing\_status \== "Single" THEN  
          IF gains\_amount \<= 44,625 THEN  
              T \= 0  
          ELSE IF gains\_amount \<= 492,300 THEN  
              T \= 6,693.75 \+ 0.15 \* (gains\_amount \- 44,625)  
          ELSE  
              T \= 72,146.25 \+ 0.20 \* (gains\_amount \- 492,300)  
          END IF

      ELSE IF filing\_status \== "Married Filing Jointly" OR filing\_status \== "Qualifying Widow(er)" THEN  
          IF gains\_amount \<= 89,250 THEN  
              T \= 0  
          ELSE IF gains\_amount \<= 553,850 THEN  
              T \= 13,387.50 \+ 0.15 \* (gains\_amount \- 89,250)  
          ELSE  
              T \= 79,387.50 \+ 0.20 \* (gains\_amount \- 553,850)  
          END IF

      ELSE IF filing\_status \== "Married Filing Separately" THEN  
          IF gains\_amount \<= 44,625 THEN  
              T \= 0  
          ELSE IF gains\_amount \<= 276,900 THEN  
              T \= 6,693.75 \+ 0.15 \* (gains\_amount \- 44,625)  
          ELSE  
              T \= 39,427.50 \+ 0.20 \* (gains\_amount \- 276,900)  
          END IF

      ELSE IF filing\_status \== "Head of Household" THEN  
          IF gains\_amount \<= 59,750 THEN  
              T \= 0  
          ELSE IF gains\_amount \<= 523,050 THEN  
              T \= 8,962.50 \+ 0.15 \* (\*

# Additional Future Considerations:

* AMT (Alternative Minimum Tax) Calc  
* NIIT (Net Investment Income Tax) Calc  
* Standard/Itemized Deductions  
* Update tax brackets/thresholds concurrent with IRS releases