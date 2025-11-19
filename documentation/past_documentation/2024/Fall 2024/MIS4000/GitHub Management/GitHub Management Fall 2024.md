#  ![][image1]

# 

# 

# MIS 4000/5000  {#mis-4000/5000}

# **GitHub Management** {#github-management}

Emerging Technologies  
Fall 2024

## 

# **Table of Contents** {#table-of-contents}

## 

[**MIS 4000/5000	1**](#mis-4000/5000)

[**GitHub Management	1**](#github-management)

[**Table of Contents	2**](#table-of-contents)

[**GitHub Branch Flow	3**](#github-branch-flow)

[1\. Main Branch (Production)	3](#1.-main-branch-\(production\))

[2\. Combined-Dev Branch	3](#2.-combined-dev-branch)

[3\. BA5200 Class Workflow	4](#3.-ba5200-class-workflow)

[4\. MIS 4000/5000 Class Workflow	4](#4.-mis-4000/5000-class-workflow)

[5\. Miscellaneous Individual Branches	4](#5.-miscellaneous-individual-branches)

[6\. Code Review and Protections	4](#6.-code-review-and-protections)

[**GitHub Version Control	5**](#github-version-control)

[**GitHub Guides & Templates	5**](#github-guides-&-templates)

[**GitHub Pull Requests	5**](#github-pull-requests)

[Pull Request Template Rules	5](#pull-request-template-rules)

[**GitHub Monthly Merges	6**](#github-monthly-merges)

## 

## 

## 

## 

## 

## 

## 

## 

## GitHub Branch Flow  {#github-branch-flow}

A [workflow diagram](https://miro.com/app/board/uXjVL93dJ3g=/?share_link_id=515899346620) was made to better visualize the process of how the branches are connected in this repository. 

**GitHub Repository Workflow Breakdown**

#### **1\. Main Branch (Production)** {#1.-main-branch-(production)}

* Represented by the **black** triangle  
* Acts as the final product or production branch.  
* Only reviewed and stable code from the **combined-dev** branch is merged here to prevent major issues.

#### **2\. Combined-Dev Branch** {#2.-combined-dev-branch}

* Represented by the **yellow** triangle  
* Serves as the integration branch for all contributions before reaching the main branch.  
* Reviewed thoroughly to ensure code quality and prevent issues in the production branch.

#### **3\. BA5200 Class Workflow** {#3.-ba5200-class-workflow}

* Represented by the **blue** rectangle and 10 **green squares**  
* The class is split into 10 teams, each represented by their own individual branches (10 green squares).  
* Workflow:  
  1. Teams develop and test their code in their respective branches.  
  2. Once the code is ready, it is pushed to the **combined-dev** branch.  
  3. Code undergoes review and fixes before merging into the **combined-dev** branch.

#### **4\. MIS 4000/5000 Class Workflow** {#4.-mis-4000/5000-class-workflow}

* Represented by two team branches and a **scraping API branch**, represented by 4 **orange** squares  
* Workflow:  
  1. Each team works in its respective branch (team branches and scraping API branch).  
  2. Similar to BA5200, code is pushed to the **combined-dev** branch for review after testing in the individual branches.  
  3. After review and fixes, the code is merged into the **combined-dev** branch.

#### **5\. Miscellaneous Individual Branches** {#5.-miscellaneous-individual-branches}

* Represented by the **purple** rectangle  
* For contributions that don’t require a dedicated team branch:  
  1. Example: A project manager updating documentation.  
* Individual contributors use their own branches to make changes.  
* Workflow:  
  1. Changes are pushed to the **combined-dev** branch (or **main** branch if applicable).  
  2. All changes must undergo review before merging.

#### **6\. Code Review and Protections** {#6.-code-review-and-protections}

* Both the **combined-dev** and **main** branches are protected:  
  * A reviewer is required to approve any code before merging.  
  * This ensures code quality and prevents unintended issues in the **main** and **combined-dev** branches 

## 

## GitHub Version Control  {#github-version-control}

1. A table was created to better explain and visually demonstrate the version control behind the scenes.   
   1. [GitHub Procedures](https://docs.google.com/document/u/0/d/1y5rg5nFGpJySQrAa0mUI6NAiAVh2dczPrQCVcwuxzYI/edit)  
2. There was also an excel sheet created to document who the reviewers were and their responsibilities.   
   1. [GitHub reviewers](https://docs.google.com/spreadsheets/u/0/d/1-mThBbpa3wwgjMJT92FZ5JVx06piXaTCRG5B96UpCJU/edit)

## 

## GitHub Guides & Templates {#github-guides-&-templates}

* All guides were moved into the guides folder included a copy of the pull request template   
* They were all reviewed before the end of the semester and updated if necessary   
* The issue template is in a hidden .github folder and is to help keep track of any ongoing issues throughout the project 





## GitHub Pull Requests {#github-pull-requests}

### **Pull Request Template Rules**   {#pull-request-template-rules}

The template **must be kept in a root directory**, meaning that the location cannot be moved into another folder or branch. 

There are **exceptions** though: 

* You can store your pull request template in the **repository's visible root directory, the docs folder, or the hidden .github directory.**   
* Pull request template filenames are **not case sensitive, and can have an extension such as *.md* or *.txt*.**  
* Source for reference: [https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates)

## GitHub Monthly Merges {#github-monthly-merges}

1. Due to the size of the project and the fact that there were over 10 teams working on it at the same time, to keep the main branch protected and up to date, it was updated monthly with everything in the development branch that would not break the main branch. 

   

2. This way the development branch would stay up to date and any broken code could be taken care of before placing it into production 

   

3. Continuing weekly updates to the development branch and monthly updates to the main branch will help prevent major issues when submitting final work at the end of the semester. Both the development and main branch are protected so direct updates cannot be made without at least one reviewer. 

   

4. The only circumstance that can receive direct updates without going through the development branch is a document for the main branch code. Any documentation updates should be automatically applied when updating the development branch.   
   1. For example, if someone is trying to make sure the main branch and the dev branch are on the same page, normally when initializing a pull request GitHub will automatically test if the branches can be merged, if not, it will automatically request the user to update the branch they are trying to add into the development branch. This way no documentation will get lost or accidentally deleted as long as those branches stay up to date. 

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPQAAABRCAYAAADl/oujAAAOS0lEQVR4Xu1dMcssWRFdEREDUVFERN429hpstoGp+GJNNjEw28jExECM3VzQPyCIoSAYGn4gGMqCf+D5B2R/gLB+NTs178zpqrp17+2Zr7vnHjjwps6p6tvVXW/m6+mZeWd+d/rs0fnOwMBRwCf3I5J7MjCwW/DJ/YjkngwM7BZ6Uv/8J9/57H//+sJDcQz0wOEwBnoM9MCBMAZ6DPTAgTAGegz0wIEwBnoM9MCBcJSBln3gWIljoAcOh70PtK7/qAON+8daDZ7zn7BWa7351fSn3hoDN4QemL0NNJ+cQvaU2HNSvjdNr3n7NSc6+71cjD9v87eo1WBea6BXqDFwQ+iB2dNA80mlZF+JPSdlz0Czl+l5Md6K3nrvvTt90ltj4IbQA7OXgeaTn8n+iL0n5Xmo3/AaSnXZd+E0fcTetZFZ38COoQd3DwO9GACHnOdxjRN7Nl7Kluqyr+RfE/fe3sCdoQd36wPNJ39EzvW4xok9Vw406/zY8lm6gj3MyG/FLD3yGZ6wHxzDGnPwaoe9kON6OM76IaE7ueWB5gOSIdewqF7uSQ3m4AS2arPGjy2fpXsei17OD6bpA/YSP/Vyrdqep8RzXthH9he296kRe8tX09+wxqGgO7nVgV4cjApyLab6uCc1mOlEPMfc2qzxY0akt2gYB745Dfc0/YE1zFV4OufKNYaL9jxErEPqVe40TV8n7WpAUVNw7dP2350+ea418VttXo1DQHdwiwPNB6GFXNOqzz2pwVwx0N+fpl9pXE60yKvwdIzLIKImwG1dDZZTD1HyeLoXR3geL67o1U+DXfAcArqDWxtobH4Pua61De5JDebCQMuzBHgX27RiCE/34iVk8koeT/fiiIzHQimvpAsynt1Dd3BLA/3B+68uje8h12Wqj3tSg9kY6HO8OYbwdC9eQiav5PF0L47IeATnl8nm38LsFZR0Qcaze+gObmWg+eDVUGv8889fWdS1qHnckxrMyYHGv09Lz9oIT/fiJWTySh5P9+KIyINaRM4TlHRBxrN76A6+9EDzQWsh1yxR87gnNZizA214orjC0714CZm8ksfTvTjC82D8RLoS7eUpSrog49k9dAdfaqAXB7KD2Wdm3jb3pAazN9DT9BGvjz3nfDOu8HQvXkImr+TxdC+OsDyZC1a9uiDj2T10B19ioLHBa5Drl6h53JMazM5An7XFGiMPxhWejnG5oo2aAO81f4mr3PI2GGoCb3Bn6KH3ARQrD1HSBRnP7qE7eI+B/viX37w0dG3ytjLUXO5JDebKgUadPawJPF3eq/U0gad5cUTJ4+kYz1Dz+AaXq5rJ95BLuiDj2T10B28x0D/98XcXB/FW5G1nqLnckwzm4M6miyc4GTnOHo6xXvKwf86s19CoxiLeU0NzOJ5lKS9T++0KDgLdsbUGmht2D/IastR87kkGc2JAzj5T4zh7OMZ6po5QX/rOifVynD0cY/1Sh/8jgwtcXg5rwCdP8+KoZz2Hge5Y70Bzo+5NXk+Gmss9Gbgd8JixNrACtLk9A83D9RLkNWWoudyTgTbg8WBNkfEMdECb2zrQ//3HFxfDdW/ymrLUfO7JQBvkCjUeF9T4Ih7rAytBm9s60HyQXoK8piw1n3sy0A4+Nh45b2AlaIP3OtC8nhpqDe7JUTB/fiHsiuy5BfgYMdmP4PXea80ZyAVGeRWC7+u/BLg/Vz3SJrcMNB+oe5PXU0ut87ZVxwL3aw/7yuvd0pq3sibuz9V6NLC3gea1tFBrQa/S4PXUkuvdArzNe223B7zeLa15K2vi/lytRwO1A33Pm0aQvI4eak3oVRq8rlpyvVvipbbbgy2ueWtrMtejgdqB1jz89635l999dbGOHmpd6FEauC4vHmkYvzVears92OOa7w2zRxqoGWgsxI8jav6vP/rWQstQcmWosVYPtS70KA1clxePNIzLRRb6Avsn1C2c3wZ6whzvYo233bP2RuLehyIi4AdArA9jMPhtrWib0ZoRst/gdXuAwBz5wAjrPTjfl961poqcZY80kB1oLCK0Yha5Tomcz9tifwu1FvQoDVyXF480fuwR8wX8yxUeMYfjUQ0vD3WOsc5gj8Uox9DMbzJhGnkLD3o5Vooj5oY1LW6RdYg5CNOjgcxA84aEkWb5suR8rdFaz6LWgh51g9fMOoK9Hu+Vw7kcz1BeObRu28vDOGsltuZhPsc03lK7NwdhejQQDfQvfvbtxUaU6pF81thTQ6uexHtqMrUW9KgbvGbWFeixXnpaNfglK/oFnsZr4u2xjlqv7sUVnp6Js3bSnV/HLOWVeivw9Jl+IAC1s/5228/rs+JgX2iWLjB1DXgDzYWRGZ9cDeeaWXItjLG3hVoLetQNXjPripLH0jFm/Y2Ff9OibtViRJ5IE6COHlxPJhef3b08L46wPFaMUfJ4uhdHWB6IXf2ggaC2d4tg7UBnfL1Xpbkexn70w+8t/LXUWtCjbvCaWVeUPJZuxTLI5EWeSBPM1xd0cL1mHHHlge8X9/K8OMLyWDFGyePpXrwXpbqmrgFvoDPEwkr2tNCqyY97uGjGCuA1s65gX0QrB2uVkMmLPJEmmJ3BxZiXSy91nzTu5XlxhOWxYoySx9O9eBYz9c8i5whMXQOtA80bFrKnlVZdftzDRTNWAK+ZdQX7Ilo5WKuETF7kiTTBPAbajJeAeSVyrsDUNbDWQLPeQ/5opsT4cQ8XzVgB3A/WFRkPoyVHkMmLPJEmmP2BNuOIRx1ozPHymnQNbHGghVybH/dw0YwVwP1gXZHxMDI5quOV7Jo8yxNpgtkZ3Norx/jtpV6eF0dYHivGKHk83Ysj2MOPLZQ8pq6B1oHGwRCy1kurNj+W7+PmWIaLZqwAXG9Uu+SxdL4hBP0C/IXHO1/lfvI8Xlzh6Zn4M9+gprBy58IvWFLdhS7w9Ktc46dq6euLnyTm1VI0r0cDexjoWpausqsPetSMuXBhY+Gnn27FWydZu8qjuvIsyM+EmnOOW3cwPUE9a91vvLonXl+NtvKxPmsn3Yjhmi09qil+KyfsXUTMS/bhSvP6F/hfW9/qwjWj9Zx0fdA60PjsKGS9l9YNJi3kukLVtMk9mJ0TKtoGezy25nCM9ZInYilfdTlRWXN4ei/WiC9qctyj+i95wa2WXPcqz/Czj+Mea+pyLIpfdP1H60D//jffuCrIei95wT3kn8rRODa5FXPDQAtm+xn0c8JdRYjoxMRtcbzWE7GUr3rJx17WXJ/x4/SeNwsvn2sHvupzgD3yE0qudq7BsStd/9Ez0PgsynoLeZFrk7dz6e7AoaEv5/H6AgLPEdZ2A92BloGWPHnW45fdODi3/PmbHo6Bfjzg8V9ozj3gu4PuQOtAb3los+SeDBwTfNwjcu5uoDtQO9B//PhriybsldyTgWOCj7tHztsVdCcyA32kIUZyT/aKo+2Ph979nKfpQz4H9C2h3UN3CAfa+5v4qOSeZMA1onqsR95W4HuTrB0Nj7KfTeAT7BHJPalFTY0aby1kqPkbQ46I800brzk+8M4YaCH3pBY1NWq8A/VY65juFnxyPyK5J7WoqVHjHajHWsd0t+CT+xHJPalFTQ326j2/StTopn5zG+Lx8rm25fF8C8/ym0KfFp7nl8FeDbkDytsPqcXHBO+TVkRr1JjmW16OWXU8H3s2C21A5ir30eidYLWoqcFePpnPMfd2UBlgzD9/D7S5L+chwvpP1skpMfShB2vryY2f6sJt4tBexSEWxE9r47V43zOGdSyNa4tHPp6JteXfiX58ank2C925MdDtqKkReeFEMz2RJmjVFJbHiinOJ76pa/y0ZuMjhQLRoot43v56cUGkIUoevVec45uHNmAMdDtqakTeSBNEAyQoabW6PhNjjOHpVj1GRrc8XlwQaQjxRM+8pzrT9CHHNw9twBjodtTUiLyRpog8kSaIdEvL9OfsebLiHGNkPBaidUUaYj7/WcNxRaRtGtqAMdDtqKkReSNNEXkiTXDaX/h43iXuvLzM9MfzWDGGl1tClBdpDM9XU2Nz0MVHA60eIWseMUcpv8DBPibnZLfL/kyeergntaipEXkjTRF5Ik3g7a/ErL9luZcRrVyOWeA6wtIP33nbFEQaw/Nasd1AdyoaaPnMsw4Aaxa1ZilmkX36SS72MTlPY+xjfY2DV1Mj8kaaIvJEmsLyWDGB9gffvrHo/WfAsQx0m9GxadUssHc+X93G2K6gDYgGOjsg6GOvFbPIvn//9ctNeRlqDvekFjU1Im+kKSJPpCl4n/kxItJKaM1DeNv34oJIs8D+mtxNQndozYH+z9+/dBkW5Afvv1p4mZyjZB+T/ZntqY97UouaGpE30hSRJ9IQ6ItyevrTmsew6kTrijQL+t755XFF7iahDVhzoKMfdGcvk/21ebIfQn0cffOnergntcjW0Y/tcVwRaYrIE2kI8Z1uSCm8LVXSBed9f7LiHGO0eqJ+R5oH9Z9z35C8L2gD1hxorVmKWbQ8EuMv+MuwtM2Wg29hLrwFoihtL9IUkSfSELrejF881t/ICq+GF0dkalt1vLgg0jxoTm3eJqE7sveBtupbMUvnnrRAa5WYzcObHljDWu8FX5N72YiBjEcw028fW1Sv3vhiEWsq2GMS7jJbaEZt+Q+CdfZYyPo2D92RaKC5OUL2lPyZvCiXfUz2K+WiGns5h3vSCxkyuAr8mvW9AvbrNWu9uEXPaurc4jx4EehJHQ20frMnkj1M8ejfsnJxSt/6yhD/Bo7WxZSvSJIfmM/m3WqgB/aFOfkn0y7QMjhH4RjoAcGhzoEx0Ac6mAPVONw5MAb6QAdzoAg95kj27BpjoA92QAceG/y/1SOSezIwsFvwyf2I5J4MDOwWfHI/IrknAwN7xf8Bo98CIo2ALZgAAAAASUVORK5CYII=>
