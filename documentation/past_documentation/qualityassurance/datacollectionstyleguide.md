**Data Collection Style Guide for AI Model Scraping**
--
This document outlines best practices and guidelines for collecting data for AI model training, with a focus on ensuring compliance with licensing, permissions, and data quality standards. The guidelines cover general licensing requirements, specific considerations for different data sources, and recommended practices for responsible data scraping.

**1. Licensing and Permissions**
--

**1.1 Creative Commons Licensing**

When using data or content available under a Creative Commons license (such as CC BY-NC-SA 4.0), adhere to the following:

  * Attribution (BY): Always credit the original creator(s).
  * Non-Commercial (NC): Use the data for non-commercial purposes only.
  * Share-Alike (SA): If you adapt, transform, or build upon the data, distribute your contributions under the same license as the original.

Ensure you provide proper citations and links back to the original source as required by the license terms.

---
**1.2 Data from Data.gov and Similar Government Data Repositories**

Data available on Data.gov is primarily from U.S. federal government agencies and is often free of copyright restrictions. However, follow these guidelines:

  * **Federal Data**: Typically, federal data is free to use without restrictions due to 17 U.S.C. § 105. Always check the "Access & Use Information" section on the dataset page for any specific terms or exceptions.
    
  * **Non-Federal Data**: Data identified by banners such as "University", "State", "Multiple Sources", etc., may have unique licensing requirements. Always review the "Access & Use Information" section for these datasets, as they may require permission or have usage restrictions.

  *  i - This is a Non-Federal dataset covered by different Terms of Use than Data.gov

---
**1.3 Reproduction and Adaptation Authorization**

Some websites require explicit authorization before reproducing or adapting their content. For example:

  * Edunomics Lab: Contact edunomics@georgetown.edu before using any of their resources for permission and citation instructions.

---
**1.4 Checking Robots.txt Files**

Always check a website's robots.txt file to understand its scraping policies. This file, typically located at the root domain (e.g., https://example.com/robots.txt), provides guidance on which parts of the site can be accessed by web crawlers. Some common directives include:

  * Disallow Specific Pages: Some sites may block specific pages or file types from being crawled.
  * Disallow Specific User Agents: Certain sites may restrict specific user agents or bots, such as "byte spider."


**2. Best Practices for Data Collection**
--

**2.1 Prioritize High-Quality Data**

When collecting data for an AI financial data language model, it is critical to maintain the highest standards of data quality, reliability, and compliance. This section outlines detailed best practices to ensure that data sources are robust, legally compliant, and suitable for training an AI model.

  * **Peer-Reviewed Sources:**
      * Data derived from academic journals, research papers, or scientific studies that have undergone a rigorous peer review process. This ensures the data's credibility, accuracy, and relevance.
      * **Why It's Important:** Peer-reviewed data is critically assessed by experts in the field, providing a level of validation that ensures the data’s accuracy and scientific rigor.
    
* **Government Publications:**
    * Use data from official government entities, such as central banks, financial regulatory bodies, and statistical agencies.
    * **Why It's Important:** Government publications often provide comprehensive, authoritative data that is regularly updated and used as a standard reference in financial analysis and modeling.
      
* **Audited Information:**
    * Utilize data that has been verified through formal auditing processes. This can include financial statements, annual reports, and disclosures from publicly traded companies.
    * **Why It's Important:** Audited data has been independently verified, reducing the risk of inaccuracies or misleading information. This type of data is crucial for ensuring the reliability of financial models and analyses.
  
* **Industry Reports from Reputable Organizations:**
    * Incorporate data from respected industry organizations, such as financial think tanks, research institutions, or market intelligence firms.
    * **Why It's Important:** These organizations often provide specialized insights and data that are not available from academic or government sources, enriching the dataset with diverse perspectives and up-to-date market intelligence.

* **Data from Credible News Outlets:**
    * Collect data and news from established financial news outlets that are known for their rigorous editorial standards.
    * **Why It's Important:** Real-time news data can provide context and additional insights that are essential for understanding market movements, investor sentiment, and emerging financial trends.

---

**2.2 Seek Authorization When Needed**

When in doubt, contact the data provider or owner to request permission, especially if the data source has any explicit terms regarding reproduction, adaptation, or redistribution.

---

**2.3 Ensure Data Relevancy**
  * **Align Data with Use Case:**
    * **Importance:** Relevant data enhances model accuracy by reducing noise.
      
  * **Use Timely Data:**
    * **Importance:** Ensures predictions and assessments are based on the latest information.
      
* **Focus on Granularity and Detail:**
    * **Importance:** Provides the appropriate information depth without overwhelming the model.
      
* **Consider Geographic Relevance:**
    * **Importance:** Reflects local market dynamics and regulatory conditions.
      
* **Balance Historical Data with Recent Trends:**
    * **Importance:** Helps the model understand both established patterns and current conditions.
      
* **Filter Out Irrelevant Data:**
    * **Importance:** Improves performance by reducing noise and preventing overfitting.
      
* **Account for Data Quality Variations:**
    * **Importance:** Prevents errors and biases that can affect model outcomes.
      
* **Consider Market-Specific Indicators:**
    * **Importance:** Tailors the model to its intended financial context.



