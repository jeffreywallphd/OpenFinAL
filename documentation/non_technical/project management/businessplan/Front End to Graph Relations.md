**Some rule ideas:**

| Action | Function | Outcome | Responsibility |
| :---- | :---- | :---- | :---- |
| User **takes** knowledge assessment | SQLite database updates table with knowledge score Graph database updates user node with knowledge score | System filters learning modules to only recommend the modules within the appropriate knowledge range of the user. | Team 4 \- to calculate the knowledge score and upload it to SQLite database (?) Team 2 \- to bring SQLite data into graph, apply recommendation/filtering based on score |
| User **takes** risk assessment | SQLite database updates table with knowledge score Graph database updates user node with risk score | System filters learning modules to only recommend the modules within the appropriate risk range of the user. | Team 3 \- to calculate the risk score and upload it to SQLite database (?) Team 2 \- to bring SQLite data into graph, apply recommendation based on score |
| User **starts** a learning module | Clicking button should trigger some kind of **function** that stores data/when a page opens The page the user is on should  | Module shows up at top of user’s list \- first priority | Team 2 |
| User **completes** a learning module | Graph database updates to reflect user knowledge increase and learning module completion Completion of the quiz or the “next button” should trigger this.  | System provides recommendation to begin next difficulty level of the same topic  | Team 2 |

**Sprint 4:**  
Connect the graph \- sync from SQLite to Graph  
Launch primitive process of adaptive learning \- even for just one module

**Sprint 5:**  
Expand or complete the adaptive learning process

- Implement the end-of-module quizzes to the software and database 

**Some notes, questions, and IDEAS:**

- How do we get the code to know whether the user has simply started/opened the module (not completed) and not started the quiz?  
  - How can we track / know which page the user is on (or the last, furthest page they visited)  
  - Every time you click the “next” button to access a new slide?  
  - Could just be linear \- once you’re on slide 2 of 10 you’ve completed 20%  
- Another idea (could be extra) once you click out of a module, you should be able to click “resume module” to get back to the slide where you left off  
- If you’ve been away from the module for long enough  
  - Either send them back to the start \- they need to relearn  
  - Or provide them a pop-up: here’s a summary of the module up until where you left off.