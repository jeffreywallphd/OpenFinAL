import { StockRequest } from "../../../Entity/StockRequest";
import { IEntity } from "../../../Entity/IEntity";
import { IKeyedDataGateway } from "../IKeyedDataGateway";

export class FinancialModelingPrepGateway implements IKeyedDataGateway {
  baseURL: string = "https://financialmodelingprep.com/api/v3/";
  apiKey: string;
  sourceName: string = "Financial Management Prep Stock API";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
    key: string;

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

  async read(entity: IEntity, action: string): Promise<Array<IEntity>> {
    var url;
    if (action === "lookup") {
      url = this.getSymbolLookupUrl(entity);
    } else if (action === "intraday") {
      url = this.getIntradayUrl(entity);
    } else if (action === "interday") {
      url = this.getInterdayUrl(entity);
    } else {
      throw new Error("Either no action was sent in the request or an incorrect action was used.");
    }

    const response = await fetch(url);
    const data = await response.json();

    if ("error" in data) {
      throw new Error(data.error); // Handle potential API errors
    }

    var entities;
    if (action === "lookup") {
      entities = this.formatLookupResponse(data);
    } else {
      entities = this.formatDataResponse(data, entity, action);
    }

    return entities;
  }

  private getSymbolLookupUrl(entity: IEntity) {
    return `${this.baseURL}search?query=${entity.getFieldValue("keyword")}&apikey=${this.apiKey}`;
  }

  private getIntradayUrl(entity: IEntity) {
    return `${this.baseURL}historical-chart/1min/${entity.getFieldValue("ticker")}?apikey=${this.apiKey}`;
  }

  private getInterdayUrl(entity: IEntity) {
    const currentDate = new Date();
    const previousDate = new Date();

    const fiveDaysAgo = new Date(previousDate.setDate(currentDate.getDate() - 5)).toISOString().split('T')[0];
    const oneMonthAgo = new Date(previousDate.setDate(currentDate.getDate() - 30)).toISOString().split('T')[0];
    const sixMonthsAgo = new Date(previousDate.setDate(currentDate.getDate() - 180)).toISOString().split('T')[0];
    const oneYearAgo = new Date(previousDate.setDate(currentDate.getDate() - 365)).toISOString().split('T')[0];
    const fiveYearsAgo = new Date(previousDate.setDate(currentDate.getDate() - 2190)).toISOString().split('T')[0];

    const intervalMap: { [key: string]: any } = { 
        "5D": {from: fiveDaysAgo, to: currentDate.toISOString().split('T')[0]},
        "1M": {from: oneMonthAgo, to: currentDate.toISOString().split('T')[0]},
        "6M": {from: sixMonthsAgo, to: currentDate.toISOString().split('T')[0]},
        "1Y": {from: oneYearAgo, to: currentDate.toISOString().split('T')[0]},
        "5Y": {from: fiveYearsAgo, to: currentDate.toISOString().split('T')[0]},
        "Max": {from: null, to: null}
    };

    const interval = intervalMap[entity.getFieldValue("interval")];

    if (!interval) {
        throw new Error("Invalid interval specified");
    }

    var fromToQuery = "";

    if(interval["from"] !== null && interval["to"] !== null) {
      fromToQuery = `from=${interval["from"]}&to=${interval["to"]}&`;
    }

    return `${this.baseURL}historical-price-full/${entity.getFieldValue("ticker")}?${fromToQuery}apikey=${this.apiKey}`;
  }

  private formatDataResponse(data: any, entity: IEntity, action: string) {
    var array: Array<IEntity> = [];
    var closingPriceKey = "close";

    if(action === "interday") {
      data = data["historical"];
      closingPriceKey = "adjClose";
    }

    const formattedData: Array<{ [key: string]: any }> = [];
    for (const item of data) {
      const date = new Date(item["date"]);
      formattedData.push({
        date: date.toLocaleDateString(),
        time: action === "intraday" ? date.toLocaleTimeString() : "", // Only include time for intraday data
        price: item[closingPriceKey],
        volume: item["volume"],
      });
    }

    entity.setFieldValue("data", formattedData.reverse());
    array.push(entity);

    return array;
  }

  private formatLookupResponse(data: any) {
    var array: Array<IEntity> = [];

    var limit = 10;
    var i = 0;

    for (const match of data) {
      var entity = new StockRequest();
      entity.setFieldValue("ticker", match["symbol"]);
      entity.setFieldValue("companyName", match["name"]);
      array.push(entity);

      // limit to the top 10 listings
      if(i >= 10) {
        break;
      }

      i++;
    }

    return array;
  }

  update(entity: IEntity, action: string): Promise<number> {
    throw new Error("This gateway does not have the ability to update content");
  }

  delete(entity: IEntity, action: string): Promise<number> {
    throw new Error("This gateway does not have the ability to delete content");
  }
}

