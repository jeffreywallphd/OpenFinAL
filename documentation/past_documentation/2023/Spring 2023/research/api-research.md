# API RESEARCH

## What is API?
    - “API is the acronym for Application Programming Interface — a software intermediary that allows two applications to talk to each other.”
    - “APIs are an accessible way to extract and share data within and across organizations.”
    - “Incorporating APIs into business operations can help:
        -- Simplify and accelerate their go-to-market strategies
        -- Enhance customer experiences
        -- Improve operational agility and speed
        -- Develop and pursue new revenue, market, and channel opportunities”
https://www.mulesoft.com/resources/api/what-is-an-api 


## How does an API work?
    - “When you use one of the above apps, they connect to the Internet and send data to a server. The server then retrieves that data, interprets it, performs the necessary actions, and sends it back to your phone. The application then interprets that data and presents you with the information you wanted in a readable way.”
    - More in the link below
https://www.mulesoft.com/resources/api/what-is-an-api 


## Do you need permission to use an API to access another application?”
    - “When a developer wants to access an API provided by a third-party software or service, they typically need to obtain an API key or some form of authentication credentials.”
        -- “Permission to use an API is usually granted through a combination of an API key, access tokens, or other authentication mechanisms. These credentials help the API provider track and control access, manage usage limits, and sometimes monetize the usage of their API.”


## How do you get permission to use an API to access another software? (ChatGPT)
    - “Getting permission to use an API involves several steps, and the exact process can vary depending on the API provider. Here is a general guide on how to obtain permission to use an API:
    - 1.) Review Documentation:
        -- Start by reviewing the API documentation provided by the software or service you want to access. Documentation usually contains information about how to use the API, what endpoints are available, any required authentication mechanisms, and terms of use.
    - 2.) Create an Account:
        -- Some API providers require users to create an account on their platform. This account creation process may involve providing some basic information about yourself or your organization.
    - 3.) Understand Terms of Service:
        -- Carefully read and understand the terms of service, terms of use, or licensing agreements associated with the API. These documents outline the conditions under which you are granted permission to use the API.
    - 4.) Get API Key or Access Token:
        -- Many APIs use API keys or access tokens for authentication. Follow the instructions in the documentation to obtain the necessary credentials. This may involve creating an application or project in the provider's developer portal.
    - 5.) Comply with Usage Policies:
        -- Ensure that your use of the API complies with the provider's usage policies. This may include limitations on the number of requests you can make, usage restrictions, and any other guidelines specified by the API provider.
    - 6.) Apply for API Access (if required):
        -- Some APIs may require you to apply for access, especially if there are usage limits or if the API provider wants to review your use case. Submit any necessary applications or requests through the provider's developer portal.
    - 7.) Payment (if applicable):
        -- If the API has associated costs, make sure you understand the pricing model and payment terms. Set up any necessary billing information and ensure compliance with the provider's payment policies.
    - 8.) Test in a Sandbox Environment (if available):
        -- Many API providers offer a sandbox or test environment where you can experiment with the API without affecting production data. Use this environment to ensure that your integration works as expected.
    - 9.) Monitor Usage and Compliance:
        -- Keep track of your API usage, stay informed about any changes to the API, and ensure ongoing compliance with the provider's terms.”


## “Building Access Permissions into Your API”
    - “In this tutorial, you will be building REST API endpoints in Python and adding resource access permissions to these endpoints using Cerbos.”
https://thenewstack.io/building-access-permissions-into-your-api/ 


## Are APIs given by a software to use on its own software or are APIs created and developed to gain access to a different software? (ChatGPT)
    - “APIs (Application Programming Interfaces) can be designed for both internal and external use. The purpose of an API is to define a set of rules and protocols that enable different software components to communicate with each other. Let's explore both scenarios:
    - 1.) Internal APIs:
        -- Some APIs are created for internal use within a software system or organization. These APIs allow different components or services within a software application to communicate with each other. Internal APIs are used to streamline the development process, promote code modularity, and ensure that various parts of a complex software system can work together seamlessly. These APIs are not typically exposed to external developers or third-party applications.
    - 2.) External APIs:
        -- Other APIs are specifically designed and exposed by a software provider for external developers to use. These are often referred to as external or public APIs. External APIs allow third-party developers to access the functionality or data provided by a software service or platform. Companies create external APIs to encourage integration with their software, foster a developer ecosystem, and enable the development of third-party applications that can enhance or extend the functionality of their platform.”


## Which stock investment risk analysis softwares or applications have external APIs? (ChatGPT)
    - As of my last knowledge update in January 2022, several stock investment risk analysis software or applications offer external APIs, allowing developers to integrate and access their functionalities. Please note that the availability of APIs and the specific features they offer can change over time. Here are a few examples as of my last update:
    - 1.) Alpha Vantage:
        -- Alpha Vantage provides a wide range of financial market data, including stock quotes, technical indicators, and historical data. They offer a free API key with limited access and a premium plan for more extensive usage.
    - 2.) IEX Cloud:
        -- IEX Cloud offers financial data APIs, including stock quotes, historical data, and financial statements. They provide a range of endpoints for developers to access market information.
    - 3.) Polygon.io:
        -- Polygon.io provides APIs for real-time and historic market data, including stock quotes, news, and financials. They offer different plans with varying levels of access.
    - 4.) Yahoo Finance API:
        -- While Yahoo Finance itself doesn't officially provide a public API, there are unofficial APIs and libraries developed by the community that allow access to Yahoo Finance data. Keep in mind that the availability of these unofficial APIs may vary.
    - 5.) AlphaSense:
        -- AlphaSense specializes in financial search and provides an API for accessing their financial document search platform. It allows developers to integrate financial data, transcripts, and other information into their applications.
    - 6.) Quandl:
        -- Quandl offers a vast collection of financial and economic data. They provide APIs for accessing datasets related to stocks, commodities, and various financial instruments.


## What are the steps to implement an API into a software application?
    - 1.) Understand the API:
        -- Familiarize yourself with the API documentation provided by the service provider. This documentation should detail the endpoints, request parameters, response formats, authentication methods, rate limits, and any other relevant information.
    - 2.) Choose the Right API:
        -- Ensure that the API you select meets your application's requirements in terms of functionality, scalability, reliability, and terms of service.
    - 3.) Set Up Authentication:
        -- Most APIs require authentication to access their resources. This could involve obtaining an API key, OAuth tokens, or other forms of authentication credentials. Implement the necessary authentication mechanism in your application.
    - 4.) API Requests:
        -- Write code to send requests to the API endpoints based on your application's requirements. This may involve making HTTP requests (GET, POST, PUT, DELETE, etc.) using libraries such as Axios, Fetch API, or libraries provided by the programming language/framework you're using.
    - 5.) Handle Responses:
        -- Process the responses returned by the API. Depending on the API, responses could be in various formats such as JSON, XML, or others. Parse the response data and extract relevant information for your application.
    - 6.) Error Handling:
        -- Implement error handling mechanisms to deal with potential issues such as network errors, server errors, and API-specific errors. This ensures that your application can gracefully handle errors and provide appropriate feedback to users.
    - 7.) Testing:
        -- Test your API integration thoroughly to ensure that it functions as expected under different scenarios. This includes testing various endpoints, different input parameters, handling of errors, and edge cases.
    - 8.) Optimization and Performance:
        -- Optimize your API calls for performance and efficiency. This may involve techniques such as caching responses, batching requests, and optimizing network communication.
    - 9.) Security:
        -- Ensure that your API integration follows security best practices. This includes protecting sensitive data, encrypting communications, and guarding against common security vulnerabilities such as injection attacks and cross-site scripting (XSS).
    - 10.) Documentation:
        -- Document your API integration within your application codebase for future reference. This helps other developers understand how the API is used within your application and facilitates maintenance and troubleshooting.
    - 11.) Monitoring and Maintenance:
        -- Monitor your API integration for performance, reliability, and compliance with the service provider's terms of service. Update your integration as needed to accommodate changes to the API or your application's requirements.


## How long does it take to implement another software's external API into a software I am developing?
    - Complexity of the API:
        -- The complexity of the API itself plays a significant role. Some APIs are straightforward and well-documented, making integration relatively quick and easy. Others may be more complex, with numerous endpoints, authentication mechanisms, and data formats, requiring more time to understand and implement.
    - Familiarity with the API:
        -- Your familiarity with the API and its documentation can also affect implementation time. If you're already familiar with similar APIs or have experience with the specific API you're integrating, you may be able to implement it more quickly.
    - Dependencies and Requirements:
        -- The specific requirements of your software application and any dependencies it has can impact implementation time. For example, if your application requires complex data transformations or additional functionality beyond basic API calls, it may take longer to implement.
    - Availability of Resources:
        -- The availability of resources, including developer expertise and time allocated to the integration, can affect implementation time. If you have a dedicated team with experience in API integration and sufficient time to work on the project, implementation may proceed more quickly.
    - Testing and Quality Assurance:
        -- Proper testing and quality assurance are essential to ensure the reliability and functionality of the API integration. Depending on the complexity of the integration and your testing processes, this phase can add additional time to the overall implementation timeline.


    - Call External API Using Node Js https & request module
        https://www.youtube.com/watch?v=ZbtZ_79UmjI 

    - Nodej External API calling through AXIOS
        https://www.youtube.com/watch?v=h-M2oXks-30

    - How to call external api in node js using fetch library
        https://www.youtube.com/watch?v=jDByOTwfXUA 

    - APIs for Beginners 2023 - How to use an API (Full Course / Tutorial)
        https://www.youtube.com/watch?v=WXsD0ZgxjRw 

    - API Key stored in .env file

    - Pimport - tool to transform python code into Node JS
