# GitHub Guidlines

## If you are unfamiliar with GitHub and Visual Studio Code
* Here is a video tutorial for beginners on how to use Git with VS Code
* [Using Git with Visual Studio Code](https://youtu.be/i_23KUAEtUM?si=peF_blDt208dr8tu)

## Branching
If you are a developer on your team, you must have Jeff Wall give you access to the repository first.

* We will be using branches to work on our coding tasks. These should be treated as short lived branches following the trunk-based repository management approach.  
    - A branch in github allows you to develop features, fix bugs, or safely experiment with new ideas in a contained area of your repository. 
    - You always create a branch from an existing branch. Typically, you might create a new branch from the default branch of your repository and our default branch is “main”. 

* Once you have successfully cloned repository in your system you will be in main branch by default. You can check it in left bottom part of your VS code window as shown in below image.
![Check Main Branch](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/check_branch.png)
* Moreover, it shows the name of the branch that is currently in use. If you are going to click on it there will be a popup as shown in below image and you can choose any other branch to switch from that popup.
![Branch Options](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/branch_options.png)

## Create a new branch:
* You can always create a branch using git checkout -b  NEW_BRANCH_NAME command however here is an alternative method:
* Step - 1 : Click on link below:
* [Repository Link](https://github.com/jeffreywallphd/AutoProphet)
* Step - 2 : Click on highlighted option (Branches) in below image:
![Branches](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/branches.png)
* Step - 3 : Now you will be redirected to branches page as shown in below image then select new branch option and there will be a popup asking you to create a new branch and always make sure that source branch is main (by default it always be main).
![Branches Page](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/branches_page.png)
![Create Branch Option](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/create_branch.png)   
* This way it will be ensured that you have created new branch without having any issues with main branch. 

## Changes from other teams:
* As discussed above everyone involved should take frequent pulls in main branch to keep repository up to date in your local systems.

* Here is the way to do it using VS code when you are already in main barnch:
* Step - 1 : Click on the source control:
![Source Control](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/Source_control.png)
* Step - 2 : Then you will be able to see below option in your side panel choose highlighted option:
![Three Dots](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/three_dots.png)  
* Step - 3 : Then you will be able to see popup just like shown in below image and select pull option and you are good to go.
![Pull Option](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/pull.png)

* Now suppose that you are in your working branch and you want to take pull from main branch into your branch or in other words you want to merge changes from main branch into your working branch to keep your working branch up to date follow below steps:
* Step - 1 : Click on the source control:
![Source Control](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/Source_control.png)
* Step - 2 : Then you will be able to see below option in your side panel choose highlighted option:
![Three Dots](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/three_dots.png)  
* Step - 3 : Then you will be able to see popup just like shown in below image and select pull,push option.
![Pull Option](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/pull.png)
* Step - 4 : Then you will be able to see popup just like shown in below image and select pull from option.
![Pull,Push Option](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/pull_from.png)
* Step - 5 : Then there will be another popup just like shown in below image and choose main branch out all branches and you are done.
![Branch Selection](https://github.com/jeffreywallphd/AutoProphet/blob/Dco_Update/documentation/images/branch_select.png)

## Above methods are using modern IDE approach however if you want to work with the traditional command line approach:
## Branching
If you are a developer on your team, you must have Jeff Wall give you access to the repository first.

* We will be using branches to work on our coding tasks. These should be treated as short lived branches following the trunk-based repository management approach.  
    - A branch in github allows you to develop features, fix bugs, or safely experiment with new ideas in a contained area of your repository. 
    - You always create a branch from an existing branch. Typically, you might create a new branch from the default branch of your repository and our default branch is “main”. 
* Please checkout the main branch (i.e., the default/primary branch) by using the command “git checkout main” 
    - You should already be on this branch if you are just starting
* You must check out a new branch to complete any work, do not make any changes on the main branch. This is accomplished with the command: git checkout BRANCH_NAME 
### Create a new branch 
* To create a new branch while on the main branch, you will run the command: git checkout -b  NEW_BRANCH_NAME
* git checkout -b NEW_BRANCH_NAME is the correct way to create a new branch and switch to it. 
    - This is a shorthand for creating a branch: git branch NEW_BRANCH_NAME and then checking it out after creation: git checkout NEW_BRANCH_NAME.
* Create new and separate branches for features or tasks. You do not want to put changes on the main branch that will break the application
* Until a feature or task is completed, leave your work on your branch and test it locally.
* As soon as you have finished the work and tested it, you must push the branch to the remote repository (i.e., GitHub) and then create a pull request

### Keeping your new local branch up-to-date with main before you create a pull request
It is always good practice to ensure that your local branch is up-to-date with the lastest edits made to the main branch of the remote repository (i.e., GitHub repository). This will minimize code conflicts you have to fix later. Be sure to do this before performing a pull request on GitHub. To do this:
* run a git pull to get the latest version of the main branch from GitHub to your local repository
* Use the checkout command to move back to the local branch you are working on (ex. git checkout MyBranch)
* Once in the local branch, use the git merge or git rebase command on your local branch to bring recent updates to main to the local branch (ex. git merge main). Don't use git rebase unless you know how rebasing works. Rebasing can create issues if you are not careful.

### Merging/Pull Requests
Once you have completed any work on your branch and have tested it on your local computer, you can push the branch to the remote repository (i.e., GitHub) and create a pull request. Create a pull request to propose and collaborate on changes to a repository. These changes are proposed in a branch, which ensures that the default branch only contains finished and approved work.
* Once your changes are ready, go to the github repository and navigate to pull requests: 
    - Click “New Pull Request”
    - Always select “base: Main” on the left side.  On the right select your branch for “compare: BRANCH_NAME”
    - Type a meaningful title and fill out given template for your pull request.
    - Assign reviewers from the infrastructure team to review your request.
    - Submit the Pull Request
* The infrastructure team will have to approve this push request so please contact the team ASAP to get your branch approved and merged
    - Assign anyone on the Infrastructure Team to do your review. 
    - Once you have assigned them, send a message to them via Discord with a link to your pull request
    - Pull Requests should be approved within 24hrs. If you have not recieved input or approval within that time frame, please contact your scrum master to escalate the request.
* Once approved, the code changes you made will be merged into the “main” branch on the remote repository
    - In order to see your changes in the main branch on your local machine, run git pull after running git checkout main (if you are not already on the local main branch)
### Merge Conflicts
* There is a chance that you may run into a Merge Conflict. If this is the case, please reach out to the infrastructure team for assistance or view the document below
* [More information regarding how this works](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)

## Changes from other teams
* Now that you know how to add code to the repository, other teams and developers may be writing code and adding it to the main branch as well. 
* What this means is that everytime you go to work on code or create a new branch, there may have been updates from other teams. 
* In order to account for this, before creating a new branch, always check out the main branch first. 
* While you are on the main branch you will run a couple different commands
    - ‘git fetch’ : downloads commits, files, and refs from a remote repository into your local repo. Fetching is what you do when you want to see what everybody else has been working on.
    - ‘git pull’ : this calls both git fetch and git merge. It fetches what other changes have been made to the branch and applies them to the branch you are currently working on
    - For our purposes, most of the time, you can just run git pull and then check out your new branch. 





 
