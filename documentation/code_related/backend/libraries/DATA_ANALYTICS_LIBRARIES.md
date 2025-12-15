## Libraries Currently Being Used in This Project

This project uses a focused set of JavaScript, Node.js, and React libraries.  
Below is a clear and specific description of each library actively used in the codebase, along with where and how it is used.

---

## 1. Data Utility Libraries

### **Lodash**
**Documentation:** https://lodash.com/  
Lodash is a popular JavaScript library that provides utility functions for common programming tasks. More specifically, it is useful for simplifying data manipulation and analysis in Node.js.
It provides utility functions that make it easier to:
- filter arrays  
- transform datasets  
- handle objects safely  
- perform common computations
- Simplify working with strings
So, Lodash offers a wide range of functions for sorting, filtering, iterating over data, and more. 

Overall, Lodash helps reduce repetitive code and improves readability whenever the application processes financial or survey data.

---

### **Underscore.js**
**Documentation:** https://underscorejs.org/  
Underscore.js is another popular utility library that provides a wide range of utility functions for data manipulation and analysis. Underscore.js offers a similar functionality to Lodash; however, it is a smaller library with a slightly different API.   
It provides functions for:
- working with arrays and collections  
- handling object operations  
- performing functional-style transformations  

Overall, Underscore.js serves a similar purpose as Lodash, and portions of the codebase rely on its helper utilities.

---

## 2. Data Visualization Library

### **ReCharts** (actively used)
**Documentation:** https://recharts.org/  

ReCharts is a common **charting library used for the visualizations** in this project.  
ReCharts is a React-based library that is built on top of D3.js, providing pre-built components for common chart types. To note, D3.js is a powerful and flexible library that provides a low-level API for creating any kind of data visualization imaginable. Furthermore, D3.js has a steep learning curve; however, it gives you ultimate control over every aspect of your visualization. 
It integrates seamlessly with React and is used to render visual representations of:
- financial data  
- survey results  
- assessment outcomes  

ReCharts components such as `<LineChart>`, `<BarChart>`, `<PieChart>`, and `<ResponsiveContainer>` help generate clean, responsive charts throughout the UI.

Overall, Recharts simplifies working with D3.js by offering a higher-level abstraction. 

---

## 3. React Libraries and Imports Used in the Code

### **Assessments.jsx**
This file imports:
- `React`
- `useState`
- `Component`
- `useNavigate`
- `useLocation`

**Only `Component` is used** inside this file.  
Although the other imports appear in the header, they are not utilized by the component's logic.

---

### **FinancialKnowledgeSurvey.jsx**
This file imports:
- `React`
- `useState`
- `useNavigate`
- `useLocation`

**All of these imports are used** within the component.  
They support:
- state management (`useState`)
- page navigation (`useNavigate`)
- accessing route-based data (`useLocation`)

---

## Summary

The following are common **libraries actively used in the project**:

- **Lodash** — data utilities  
- **Underscore.js** — data utilities  
- **ReCharts** — data visualization  
- **React** (core library)  
- **React Router** (`useNavigate`, `useLocation`)  
- **React state utilities** (`useState`, `Component`)

This list reflects the tooling that directly supports the project's implemented features and UI behavior.
