import {IInputBoundary} from "./IInputBoundary";
import {IRequestModel} from "../Gateway/Request/IRequestModel";
import {IResponseModel} from "../Gateway/Response/IResponseModel";
import { JSONRequest } from "../Gateway/Request/JSONRequest";
import {JSONResponse} from "../Gateway/Response/JSONResponse";
import { XMLResponse } from "../Gateway/Response/XMLResponse";
import {IDataGateway} from "../Gateway/Data/IDataGateway";
import {SecRequest} from "../Entity/SecRequest";
import {SecReportGatewayFactory} from "../Gateway/Data/FinancialReportGatewayFactory";

declare global {
    interface Window { convert: any; }
}

export class SecInteractor implements IInputBoundary {
    requestModel: IRequestModel;
    responseModel: IResponseModel;
    archivesPath: string;
    valuesData: any;

    async post(requestModel: IRequestModel): Promise<IResponseModel> {    
        return this.get(requestModel);
    }
    
    async get(requestModel: IRequestModel): Promise<IResponseModel> {
        if(requestModel.request.request.sec.action === "10-K" || requestModel.request.request.sec.action === "10-Q") {
            return this.getReportLink(requestModel);    
        } else {
            //create sec request object and fill with request model
            var sec = new SecRequest();
            sec.fillWithRequest(requestModel);

            //instantiate the correct API gateway
            const config = await window.config.load();
            
            const secGatewayFactory = new SecReportGatewayFactory();
            var secGateway: IDataGateway = await secGatewayFactory.createGateway(config);

            sec.setFieldValue("key", secGateway.key);
            
            //search for the requested information via the API gateway
            var results = await secGateway.read(sec, requestModel.request.request.sec.action);
            
            //convert the API gateway response to a JSON reponse object
            var response = new JSONResponse();
            
            response.convertFromEntity(results, false);

            return response.response;
        }
        
    }
    
    async put(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }
    
    async delete(requestModel: IRequestModel): Promise<IResponseModel> {
        return this.get(requestModel);
    }

    async getReportLink(requestModel: IRequestModel): Promise<IResponseModel> {
        var schemaResponse = null;
        const zeroStrippedCik = requestModel.request.request.sec.cik.replace(/^0+/, "");
        const type = requestModel.request.request.sec.action;

        // get SEC report data from companyFacts API
        var secRequestObj = new JSONRequest(`{
            "request": {
                "sec": {
                    "action": "companyLookup",
                    "cik": "${requestModel.request.request.sec.cik}"
                }
            }
        }`);

        const companyResponse = await this.get(secRequestObj);

        // get SEC submissions from submissions API
        secRequestObj = new JSONRequest(`{
            "request": {
                "sec": {
                    "action": "submissionsLookup",
                    "cik": "${requestModel.request.request.sec.cik}"
                }
            }
        }`);

        const submissionsResponse = await this.get(secRequestObj);

        const mostRecentSubmissionIndex:number = this.findMostRecentFilingIndex(submissionsResponse, type);

        // set up response object to fill with data
        const response: {[key: string]: any } = {response: {
            reportDate: submissionsResponse.response.results[0].data.filings.recent["reportDate"][mostRecentSubmissionIndex],
            filingDate: submissionsResponse.response.results[0].data.filings.recent["filingDate"][mostRecentSubmissionIndex],
            link: null
        }};

        // accession number associated with the particular report on the SEC's website
        const accessionNumber = submissionsResponse.response.results[0].data.filings.recent["accessionNumber"][mostRecentSubmissionIndex].replace(/-/g, "");
        
        // create consistent filename format used for SEC reports
        const [year, month, day] = submissionsResponse.response.results[0].data.filings.recent["reportDate"][mostRecentSubmissionIndex].split("-");
        const htmlFileName = `${requestModel.request.request.sec.ticker.toLowerCase()}-${year}${month}${day}.htm`;
        
        // TODO: Should these fetches be moved to a gateway?
        this.archivesPath = `https://sec.gov/Archives/edgar/data/${zeroStrippedCik}/${accessionNumber}/`;

        response["response"]["link"] = this.archivesPath + htmlFileName;

        schemaResponse = new JSONResponse(JSON.stringify(response));
        return schemaResponse.response;
    }

    // TODO: this is an OLD method. Still needs work to build a report from scratch
    // TODO: break up this method into multiple methods
    async getReport(requestModel: IRequestModel): Promise<IResponseModel> {
        const zeroStrippedCik = requestModel.request.request.sec.cik.replace(/^0+/, "");
        const type = requestModel.request.request.sec.action;

        // get SEC report data from companyFacts API
        var secRequestObj = new JSONRequest(`{
            "request": {
                "sec": {
                    "action": "companyLookup",
                    "cik": "${requestModel.request.request.sec.cik}"
                }
            }
        }`);

        const companyResponse = await this.get(secRequestObj);

        // get SEC submissions from submissions API
        secRequestObj = new JSONRequest(`{
            "request": {
                "sec": {
                    "action": "submissionsLookup",
                    "cik": "${requestModel.request.request.sec.cik}"
                }
            }
        }`);

        const submissionsResponse = await this.get(secRequestObj);

        const mostRecentSubmissionIndex:number = this.findMostRecentFilingIndex(submissionsResponse, type);

        // set up response object to fill with data
        const response: {[key: string]: any } = {response: {
            reportDate: submissionsResponse.response.results[0].data.filings.recent["reportDate"][mostRecentSubmissionIndex],
            filingDate: submissionsResponse.response.results[0].data.filings.recent["filingDate"][mostRecentSubmissionIndex],
            statements: {},
            link: null
        }};

        // accession number associated with the particular report on the SEC's website
        const accessionNumber = submissionsResponse.response.results[0].data.filings.recent["accessionNumber"][mostRecentSubmissionIndex].replace(/-/g, "");
        
        // create consistent filename format used for SEC reports
        const [year, month, day] = submissionsResponse.response.results[0].data.filings.recent["reportDate"][mostRecentSubmissionIndex].split("-");
        const calFileName = `${requestModel.request.request.sec.ticker.toLowerCase()}-${year}${month}${day}_cal.xml`;
        const xsdFileName = `${requestModel.request.request.sec.ticker.toLowerCase()}-${year}${month}${day}.xsd`;
        const dataFileName = `${requestModel.request.request.sec.ticker.toLowerCase()}-${year}${month}${day}_htm.xml`;
        const labFileName = `${requestModel.request.request.sec.ticker.toLowerCase()}-${year}${month}${day}_lab.xml`;
        const htmlFileName = `${requestModel.request.request.sec.ticker.toLowerCase()}-${year}${month}${day}.htm`;
        
        // TODO: Should these fetches be moved to a gateway?
        this.archivesPath = `https://sec.gov/Archives/edgar/data/${zeroStrippedCik}/${accessionNumber}/`;

        const reportLink = response["response"]["link"] = this.archivesPath + htmlFileName;

        // get _cal.xml file that contains calculation logic for building financial statements
        const reportXmlString = await fetch(this.archivesPath + calFileName);
        const xmlResponse = new XMLResponse(await reportXmlString.text());

        // get xsd file that contains human readable names of financial statements
        const xsdString = await fetch(this.archivesPath + xsdFileName);
        const xsdResponse = new XMLResponse(await xsdString.text());

        // get xml file that contains the concept value data
        const dataString = await fetch(this.archivesPath + dataFileName);
        const xmlData = new XMLResponse(await dataString.text());

        // get xml file that contains labels for concepts
        const labelString = await fetch(this.archivesPath + labFileName);
        const xmlLabels = new XMLResponse(await labelString.text())
        
        var schemaResponse = null;
        var reports:any = {};
        try {
            const reportXML = xmlResponse.response;
            const reportXSD = xsdResponse.response;

            var reportCounter = 0;
            // loop through all of the financial statements in link:calculationLink element
            for(var report of reportXML.documentElement.getElementsByTagName("link:calculationLink")) {
                // extract financial statement information from XML/XSD
                var reportId = reportXML.documentElement.getElementsByTagName("link:roleRef")[reportCounter].getAttribute("xlink:href").split("#")[1];
                var reportNameElement = reportXSD.getElementById(reportId).getElementsByTagName("link:definition")[0];
                var reportName = reportNameElement.textContent || reportNameElement.innerText || reportNameElement.innerHTML;
                
                // parse the report name and get the portion after the last hyphen
                const nameSegments = reportName.split("-");
                reportName = nameSegments[nameSegments.length-1]
                reports[reportId] = {
                    title: reportName,
                    dates: [],
                    primaryDivisor: null,
                    concepts: {} 
                };
                
                // create an object to lookup concepts for the report
                const conceptLocations = report.getElementsByTagName("link:loc");
                const conceptLookupObj = this.createConceptLookupObj(conceptLocations, xmlData, xmlLabels, type, ["us-gaap",requestModel.request.request.sec.ticker.toLowerCase()]);
                if(conceptLookupObj === undefined) {
                    continue;
                }

                // identify the dates if data for multiple dates is provided
                reports[reportId]["dates"] = conceptLookupObj["dates"].length > 1 ? conceptLookupObj["dates"] : null;

                var maxDivisorCount=0;
                for(key of Object.keys(conceptLookupObj["divisorCount"])) {
                    if(conceptLookupObj["divisorCount"][key] > maxDivisorCount) {
                        maxDivisorCount = conceptLookupObj["divisorCount"][key];
                        reports[reportId]["primaryDivisor"] = key;
                    }
                }
                
                // infer the parent and children of each concept
                for(var conceptCalc of report.getElementsByTagName("link:calculationArc")) {
                    //get the parent and child of the calculation arc
                    const parentConceptXLink = conceptCalc.getAttribute("xlink:from");
                    const parentConceptId = conceptLookupObj[parentConceptXLink];
                    const childConceptXLink = conceptCalc.getAttribute("xlink:to");
                    const childConceptId = conceptLookupObj[childConceptXLink];

                    // create parent and child connections
                    if(conceptLookupObj[childConceptId]) {
                        conceptLookupObj[childConceptId]["parent"] = parentConceptId;
                        const childConcept = conceptLookupObj[childConceptId];

                        if(conceptLookupObj[parentConceptId]) {
                            conceptLookupObj[parentConceptId]["concepts"][childConceptId] = childConcept;
                        }
                    }
                }

                // extract root objects from conceptLookupObj
                for(var key in conceptLookupObj) {
                    if(conceptLookupObj[key].hasOwnProperty("parent") && conceptLookupObj[key]["parent"] === "root") {
                        reports[reportId]["concepts"][key] = conceptLookupObj[key];
                    }
                }

                reports[reportId] = this.calculateLevel(reports[reportId]);

                reportCounter++;
            }

            // add reports object to response object
            response.response.statements = reports;

            //TODO: for consistency, consider wrapping object in {response: {}}
            schemaResponse = new JSONResponse(JSON.stringify(response));
        } catch(error) {
            window.console.error(error);
            return undefined;
        }
       
        return schemaResponse.response;
    }

    createConceptLookupObj(conceptLocations: any, xmlData: XMLResponse, xmlLabels: XMLResponse, type: string, sources:any=["us-gaap"]) {
        const conceptLookupObj: { [key: string]: any } = {
            divisorCount: {},
            dates: []
        };
              
        // loop over concept locations to create concept lookup object
        for (const conceptLocation of conceptLocations) {
            const conceptId = conceptLocation.getAttribute("xlink:href").split("#")[1].split("_")[1];
            
            try {
                if(!conceptLookupObj.hasOwnProperty(conceptId)) {
                    const conceptObj: { [key: string]: any } = {
                        conceptId: null,
                        unit: null,
                        label: null,
                        description: null,
                        valuePrevious: null,
                        value: null,
                        valueDivisor: 1,
                        valueDivisorDescription: null,
                        level: 0,
                        parent: "root",
                        concepts: {}    
                    };

                    // set concept object conceptId
                    conceptObj["conceptId"] = conceptId;

                    //check to see if concept value exists in common sources
                    var conceptValues = null;
                    for(var source of sources) {
                        const conceptTagName = source + ":" + conceptId;
                        const valueElements = xmlData.response.documentElement.getElementsByTagName(conceptTagName);
                        
                        if(valueElements !== undefined && valueElements.length > 0) {
                            conceptValues = valueElements;
                            break;
                        }
                    }
                    
                    // set concept object unit
                    var unit;
                    if(conceptValues && conceptValues.length > 0) {
                        // convert units to units in SEC company facts API for future flexibility
                        if(conceptValues[0].getAttribute("unitRef") === "usd") {
                            unit = "USD";                 
                        } else if(conceptValues[0].getAttribute("unitRef") === "shares") {
                            unit = "shares";
                        } else if(conceptValues[0].getAttribute("unitRef") === "usdPerShare") {
                            unit = "USD/shares"
                        } else if(conceptValues[0].getAttribute("unitRef") === "pure") {
                            unit = "pure"
                        } else {
                            return undefined;
                        }

                        conceptObj["unit"] = unit;
                    }
                    
                    // set the concept label by checking common sources
                    for(var source of sources) {
                        const conceptLabelId = "lab_" + source + "_" + conceptId + "_label_en-US";
                        const conceptLabelElement = xmlLabels.response.getElementById(conceptLabelId);
                        
                        if(conceptLabelElement) {
                            const conceptLabel = conceptLabelElement.textContent || conceptLabelElement.innerText || conceptLabelElement.innerHTML;
                            conceptObj["label"] = conceptLabel;
                            break;
                        } 
                    } 
                    
                    // TODO: find out where the concept descripions are stored. Could use company facts API if needed.

                    // set the concept previous and current values; previous values may not exist
                    // check to see if more than one value exists; some reports show current data and previous year/quarter data
                    var previousValue;
                    if(conceptValues && conceptValues.length > 1) {
                        // value elements are not guaranteed to be in order of appearance
                        // must compare dates of data context in XML document to know value 
                        var valueElement;
                        var previousValueElement;

                        // get first appearance of concept data xml file and associated context
                        const element1 = conceptValues[0];
                        var contextPeriod1 = xmlData.response.getElementById(element1.getAttribute("contextRef")).getElementsByTagName("period")[0].getElementsByTagName("instant")[0];
                        if(!contextPeriod1) {
                            // many xml context tags use instant for date. Some use startDate and endDate
                            contextPeriod1 = xmlData.response.getElementById(element1.getAttribute("contextRef")).getElementsByTagName("period")[0].getElementsByTagName("endDate")[0]
                        }
                        const contextPeriod1Text = contextPeriod1.textContent || contextPeriod1.innerText || contextPeriod1.innerHTML;
                        const contextPeriod1Date = new Date(contextPeriod1Text);

                        // get second appearance of concept in data xml file and associated context
                        const element2 = conceptValues[1];
                        var contextPeriod2 = xmlData.response.getElementById(element2.getAttribute("contextRef")).getElementsByTagName("period")[0].getElementsByTagName("instant")[0];
                        if(!contextPeriod2) {
                            // many xml context tags use instant for date. Some use startDate and endDate
                            contextPeriod2 = xmlData.response.getElementById(element2.getAttribute("contextRef")).getElementsByTagName("period")[0].getElementsByTagName("endDate")[0]
                        }
                        const contextPeriod2Text = contextPeriod2.textContent || contextPeriod2.innerText || contextPeriod2.innerHTML;
                        const contextPeriod2Date = new Date(contextPeriod2Text);

                        if(contextPeriod1Date > contextPeriod2Date) {
                            valueElement = element1;
                            previousValueElement = element2;
                            conceptLookupObj["dates"] = [contextPeriod2Text, contextPeriod1Text];
                        } else {
                            valueElement = element2;
                            previousValueElement = element1;
                            conceptLookupObj["dates"] = [contextPeriod1Text, contextPeriod2Text];
                        }

                        conceptObj["value"] = valueElement.textContent || valueElement.innerText || valueElement.innerHTML;
                        conceptObj["previousValue"] = previousValueElement.textContent || previousValueElement.innerText || previousValueElement.innerHTML;
                    } else if(conceptValues && conceptValues.length === 1) {
                        conceptObj["value"] = conceptValues[0].textContent || conceptValues[0].innerText || conceptValues[0].innerHTML;
                    } 

                    // set value divisor
                    var divisor=1;
                    var divisorDescription=null;
                    
                    if(conceptValues && conceptValues.length > 0) {
                        if(conceptValues[0].getAttribute("decimals") === "-2") {
                            divisor = 100;
                            divisorDescription = "hundreds";
                        } else if(conceptValues[0].getAttribute("decimals") === "-3") {
                            divisor = 1000;
                            divisorDescription = "thousands";
                        } else if(conceptValues[0].getAttribute("decimals") === "-4") {
                            divisor = 10000;
                            divisorDescription = "tens of thousands";
                        } else if(conceptValues[0].getAttribute("decimals") === "-5") {
                            divisor = 100000;
                            divisorDescription = "hundreds of thousands";
                        } else if(conceptValues[0].getAttribute("decimals") === "-6") {
                            divisor = 1000000;
                            divisorDescription = "millions";
                        } else if(conceptValues[0].getAttribute("decimals") === "-7") {
                            divisor = 10000000;
                            divisorDescription = "tens of millions";
                        } else if(conceptValues[0].getAttribute("decimals") === "-8") {
                            divisor = 100000000;
                            divisorDescription = "hundreds of millions";
                        } else if(conceptValues[0].getAttribute("decimals") === "-9") {
                            divisor = 1000000000;
                            divisorDescription = "billions";
                        }
                    }
                    
                    conceptObj["valueDivisor"] = divisor;
                    conceptObj["valueDivisorDescription"] = divisorDescription;
                    
                    if(divisorDescription) {
                        conceptLookupObj["divisorCount"][divisorDescription] = conceptLookupObj["divisorCount"].hasOwnProperty(divisorDescription) ? conceptLookupObj["divisorCount"][divisorDescription]+1 : 0;
                    }
                    
                    // add keys for conceptId for concept storage
                    conceptLookupObj[conceptId] = conceptObj;
                }
            } catch(error) {
                window.console.error(error);
                continue;
            }

            // add keys for xlink:label for xlink:from and :to lookup; return conceptId
            conceptLookupObj[conceptLocation.getAttribute("xlink:label")] = conceptId;
        }

        return conceptLookupObj;
    }

    private calculateLevel(report:any, level:number=0): any {
        for(var key in report["concepts"]) {
            report["concepts"][key]["level"] = level;

            if(Object.keys(report["concepts"][key]["concepts"]).length > 0) {
                report["concepts"][key] = this.calculateLevel(report["concepts"][key], level+1);
            }
        }

        return report;
    }

    private findMostRecentFilingIndex(submissionsResponse: IResponseModel, type:string): number {
        var index = undefined;
        
        // loop assumes that SEC maintains API standard of presenting most recent submissions first
        for(var i in submissionsResponse.response.results[0].data.filings.recent.form) {
            const reportType = submissionsResponse.response.results[0].data.filings.recent.form[i];
            
            if(reportType === type) {
                return index = Number(i);
            }
        }

        return index;
    }

    private getConceptDetails(data:any, concept:string, reportType:string="10-K", source:string="us-gaap") {
        const conceptObj: { [key: string]: any } = {
            conceptId: null,
            unit: null,
            label: null,
            description: null,
            value: null,
            level: null,
            parent: "root",
            concepts: {}    
        };
        
        if(!data[source].hasOwnProperty(concept)) {
            return conceptObj;
        }

        // get concept details from SEC company facts API
        var units = data[source][concept]["units"];
        var conceptLabel = data[source][concept]["label"];
        var conceptDescription = data[source][concept]["description"];
        var unit;

        // find the correct unit for the concept
        // find most recent index for the specified report type (i.e., 10-K or 10-Q)
        if(units.hasOwnProperty("USD")) {
            unit = "USD";                 
        } else if(units.hasOwnProperty("shares")) {
            unit = "shares";
        } else if(units.hasOwnProperty("USD/shares")) {
            unit = "USD/shares"
        } else if(units.hasOwnProperty("pure")) {
            unit = "pure"
        } else {
            return undefined;
        }

        const value = this.getConceptValue(data[source][concept]["units"][unit], reportType);

        conceptObj["conceptId"] = concept;
        conceptObj["unit"] = unit;
        conceptObj["label"] = conceptLabel;
        conceptObj["description"] = conceptDescription;
        conceptObj["value"] = value ? value : null;
        conceptObj["level"] = 0;
        conceptObj["parent"] = "root";
        conceptObj["concepts"] = {};
        return conceptObj;
    }

    private getConceptValue(data:any, reportType:string) {
        const startingIndex = data.length - 1;
        const index = this.findIndexForConceptValue(data, reportType, startingIndex);

        if(index === undefined) {
            return undefined;
        } else {
            return data[index]["val"];
        }
    }

    private findIndexForConceptValue(data:any, reportType:string, index:number = 0) {
        try {
            if(data[index]["form"] === reportType) {
                return index;
            } else {
                this.findIndexForConceptValue(data, reportType, index-1);
            }
        } catch(error) {
            return undefined;
        }

        if(index === 0) {
            return undefined;
        }
    }
}