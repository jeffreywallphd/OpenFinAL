import { withViewComponent } from "./withViewComponent";
//imports unwarapped JSX components
import { TimeSeriesChart } from "../View/Stock/TimeSeriesChart";
import { TickerSearchBar } from "../View/Stock/TickerSearchBar";
import { TickerSidePanel } from "../View/Stock/TickerSidePanel";


//Exports the wrapped component ready to be used with the type checking
export const WrappedTickerSearchBar = withViewComponent(TickerSearchBar);
export const WrappedTimeSeriesChart  = withViewComponent(TimeSeriesChart);
export const WrappedTickerSidePanel  = withViewComponent(TickerSidePanel);
