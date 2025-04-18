import {IEntity} from "../../Entity/IEntity";
import { StockRequest } from "../../Entity/StockRequest";
import { IKeylessDataGateway } from "./IKeylessDataGateway";

// allow the yahoo.finance contextBridge to be used in TypeScript
declare global {
    interface Window { 
      yahooFinance: any 
    }
}

export class YFinanceStockGateway implements IKeylessDataGateway {
  sourceName: string = "Yahoo Finance (unofficial) Community API";
     
  connect(): void {
    // No connection needed for this data gateway
    throw new Error("This gateway requires no special connection");
  }

  disconnect(): void {
    // No disconnection needed for this data gateway
    throw new Error("This gateway requires no special connection, so no disconnection is necessary");
  }

  create(entity: IEntity, action: string): Promise<Boolean> {
    throw new Error("This gateway does not have the ability to post content");
  }

  async read(entity: IEntity, action: string): Promise<IEntity[]> {
    var data;
    if (action === "lookup") {
        data = await this.searchSymbol(entity);
    } else if (action === "intraday") {
        data = await this.getIntradayData(entity);
    } else if (action === "interday") {
        data = await this.getInterdayData(entity);
    } else {
        throw new Error("Either no action was sent in the request or an incorrect action was used.");
    }

    var entities;
    if (action === "lookup") {
        entities = this.formatLookupResponse(data);
    } else {
        entities = this.formatDataResponse(data, entity, action);
    }

    return entities;
  }
    
  formatDataResponse(data: any, entity: IEntity, action: string): any {
    var array: Array<IEntity> = [];
    var closingPriceKey = "close";

    if(action === "interday") {
      closingPriceKey = "adjClose";
    } else if(action === "intraday") {
      data = data["quotes"];
    }

    const formattedData: Array<{ [key: string]: any }> = [];
    for (const item of data) {
      const date = new Date(item["date"]);

      // Only keep data if the price is greater than $1.00
      if(item[closingPriceKey] > 1) {
        formattedData.push({
          date: date.toLocaleDateString(),
          time: action === "intraday" ? date.toLocaleTimeString() : "", // Only include time for intraday data
          price: item[closingPriceKey] ? Math.round(item[closingPriceKey]*100)/100: null,
          volume: item["volume"],
        });
      }
    }

    entity.setFieldValue("data", formattedData);
    array.push(entity);

    return array;
  }

  formatLookupResponse(data: any): any {
    var array: Array<IEntity> = [];

    for (const item of data) {
      var entity = new StockRequest();
      entity.setFieldValue("ticker", item["symbol"]);
      entity.setFieldValue("companyName", item["shortname"]);
      array.push(entity);
    }

    return array;
  }

  update(entity: IEntity, action: string): Promise<number> {
    throw new Error("This gateway does not have the ability to update content");
  }

  delete(entity: IEntity, action: string): Promise<number> {
    throw new Error("This gateway does not have the ability to delete content");
  }
  
  private async searchSymbol(entity: IEntity) {
    const keyword = entity.getFieldValue("keyword");

    try {
        const searchOptions = {
            quotesCount: 10
        };
        const searchResult = await window.yahooFinance.search(keyword, searchOptions);

        // the filter ensures only results with a symbol are mapped
        const symbols = searchResult.quotes.filter((result:any) => result.symbol).map((result:any) => ({
            ticker: result.symbol,
            companyName: result.shortName
        }));
        return symbols;
    } catch (error) {
        throw new Error("Error occurred while searching for symbols: " + error.message);
    }        
  }

  private isPreMarketOpen() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Check if hour is less than 9 or if it's 9 and minute is less than 30
    return hour < 9 || (hour === 9 && minute < 30);
  }

  private async getIntradayData(entity: IEntity) {
    try {
      // TODO: continue to improve logic to account for stock market holidays and closures
      var currentDate = new Date();
      var date = new Date();

      // check if current date is a weekend. If so, use Friday stock data
      if(currentDate.getDay() === 6) {
        // check if Saturday
        currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
      } else if(currentDate.getDay() === 0) {
        // check if Sunday
        currentDate = new Date(currentDate.setDate(currentDate.getDate() - 2));
      }

      //check if current time is before market open. If so, use previous day
      if( (currentDate.getDay() !== 0 || currentDate.getDay() !== 6) && this.isPreMarketOpen() ) {
        // If Monday, look for Friday data, otherwise look to previous day
        if(currentDate.getDay() === 1) {
          currentDate = new Date(currentDate.setDate(currentDate.getDate() - 3));
        } else {
          currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
        }
      }

      // set start date to stock market opening at 9:30am
      const startDate = new Date(date.setDate(currentDate.getDate()));
      startDate.setHours(9);
      startDate.setMinutes(30);
      startDate.setMilliseconds(0);

      // set end date to stock market closeing at 4:00pm
      const endDate = new Date(date.setDate(currentDate.getDate()));
      endDate.setHours(16);
      endDate.setMinutes(0);
      endDate.setMilliseconds(0);

      const queryOptions = {
        period1: startDate,
        period2: endDate,
        interval: "1m"
      };

      const data = await window.yahooFinance.chart(entity.getFieldValue("ticker"), queryOptions);
      console.log(data);
      return data;
    } catch (error) {
      throw new Error("Error occurred while fetching intraday data: " + error.message);
    }
  }

  private async getInterdayData(entity: IEntity) {
    var period1;
    const currentDate = new Date();
    const previousDate = new Date();

    const fiveDaysAgo = new Date(previousDate.setDate(currentDate.getDate() - 5));
    const oneMonthAgo = new Date(previousDate.setDate(currentDate.getDate() - 30));
    const sixMonthsAgo = new Date(previousDate.setDate(currentDate.getDate() - 180));
    const oneYearAgo = new Date(previousDate.setDate(currentDate.getDate() - 365));
    const fiveYearsAgo = new Date(previousDate.setDate(currentDate.getDate() - 2190));
    const twentyYearsAgo = new Date(previousDate.setDate(currentDate.getDate() - 7300));

    const period1Map: { [key: string]: any } = { 
        "5D": fiveDaysAgo,
        "1M": oneMonthAgo,
        "6M": sixMonthsAgo,
        "1Y": oneYearAgo,
        "5Y": fiveYearsAgo,
        "Max": twentyYearsAgo
    };

    period1 = period1Map[entity.getFieldValue("interval")];

    try {
        const data = await window.yahooFinance.historical(entity.getFieldValue("ticker"), {
            period1: period1,
            period2: new Date()
        });
        return data;
    } catch (error) {
        throw new Error("Error occurred while fetching interday data: " + error.message);
    }
  }
}