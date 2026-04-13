import { withViewComponent } from "./withViewComponent";

// Stock
import { TimeSeriesChart } from "../View/Stock/TimeSeriesChart";
import { TickerSearchBar } from "../View/Stock/TickerSearchBar";
import { TickerSidePanel } from "../View/Stock/TickerSidePanel";

// Dashboard
import { EconomicChart } from "../View/Dashboard/EconomicChart";

// Learning Module
import { Slide } from "../View/LearningModule/Slideshow/Slide";
import { SlideshowWindow } from "../View/LearningModule/Slideshow/SlideshowWindow";
import { LearningModuleDetails } from "../View/LearningModule/LearningModuleDetails";
import { LearningModulePage } from "../View/LearningModule/LearningModulePage";

// News
import { NewsListingSummary } from "../View/News/Listing/Summary";
import { NewsSearchBar } from "../View/News/SearchBar";
import { NewsBrowser } from "../View/News/Browser";
import { NewsListing } from "../View/News/Listing";

// Portfolio
import { PortfolioCreation } from "../View/Portfolio/Creation";

// Settings
import { SettingsRow } from "../View/Settings/Row";
import { SettingsRowLabel } from "../View/Settings/RowLabel";
import { SettingsRowValue } from "../View/Settings/RowValue";

// Shared
import { SymbolSearchBar } from "../View/Shared/SymbolSearchBar";

// Top-level views
import About from "../View/About";
import { Analysis } from "../View/Analysis";
import BuyReport from "../View/BuyReport";
import Chatbot from "../View/Chatbot";
import Forecast from "../View/Forecast";
import { ForecastFeature } from "../View/ForecastFeature";
import ForecastModel from "../View/ForecastModel";
import Home from "../View/Home";
import InvestmentPool from "../View/InvestmentPool";
import { Learn } from "../View/Learn";
import { MovingAvgChart } from "../View/MovingAVGChart";
import { News } from "../View/News";
import Portfolio from "../View/Portfolio";
import RiskAnalysis from "../View/RiskAnalysis";
import RiskSurvey from "../View/RiskSurvey";
import { ROCChart } from "../View/ROCChart";
import { RSIChart } from "../View/RSIChart";
import { Settings } from "../View/Settings";
import { TimeSeries } from "../View/Stock";
import StockAnalysis from "../View/StockAnalysis";
import { StockAnalysisSearchBar } from "../View/StockAnalysisSearchBar";

// Stock
export const WrappedTickerSearchBar  = withViewComponent(TickerSearchBar);
export const WrappedTimeSeriesChart  = withViewComponent(TimeSeriesChart);
export const WrappedTickerSidePanel  = withViewComponent(TickerSidePanel);

// Dashboard
export const WrappedEconomicChart    = withViewComponent(EconomicChart);

// Learning Module
export const WrappedSlide                  = withViewComponent(Slide);
export const WrappedSlideshowWindow        = withViewComponent(SlideshowWindow);
export const WrappedLearningModuleDetails  = withViewComponent(LearningModuleDetails);
export const WrappedLearningModulePage     = withViewComponent(LearningModulePage);

// News
export const WrappedNewsListingSummary  = withViewComponent(NewsListingSummary);
export const WrappedNewsSearchBar       = withViewComponent(NewsSearchBar);
export const WrappedNewsBrowser         = withViewComponent(NewsBrowser);
export const WrappedNewsListing         = withViewComponent(NewsListing);

// Portfolio
export const WrappedPortfolioCreation   = withViewComponent(PortfolioCreation);

// Top-level views
export const WrappedAbout                   = withViewComponent(About);
export const WrappedAnalysis                = withViewComponent(Analysis);
export const WrappedBuyReport               = withViewComponent(BuyReport);
export const WrappedChatbot                 = withViewComponent(Chatbot);
export const WrappedForecast                = withViewComponent(Forecast);
export const WrappedForecastFeature         = withViewComponent(ForecastFeature);
export const WrappedForecastModel           = withViewComponent(ForecastModel);
export const WrappedHome                    = withViewComponent(Home);
export const WrappedInvestmentPool          = withViewComponent(InvestmentPool);
export const WrappedLearn                   = withViewComponent(Learn);
export const WrappedMovingAvgChart          = withViewComponent(MovingAvgChart);
export const WrappedNews                    = withViewComponent(News);
export const WrappedPortfolio               = withViewComponent(Portfolio);
export const WrappedRiskAnalysis            = withViewComponent(RiskAnalysis);
export const WrappedRiskSurvey              = withViewComponent(RiskSurvey);
export const WrappedROCChart                = withViewComponent(ROCChart);
export const WrappedRSIChart                = withViewComponent(RSIChart);
export const WrappedSettings                = withViewComponent(Settings);
export const WrappedTimeSeries              = withViewComponent(TimeSeries);
export const WrappedStockAnalysis           = withViewComponent(StockAnalysis);
export const WrappedStockAnalysisSearchBar  = withViewComponent(StockAnalysisSearchBar);

// Settings
export const WrappedSettingsRow        = withViewComponent(SettingsRow);
export const WrappedSettingsRowLabel   = withViewComponent(SettingsRowLabel);
export const WrappedSettingsRowValue   = withViewComponent(SettingsRowValue);

// Shared
export const WrappedSymbolSearchBar    = withViewComponent(SymbolSearchBar);
