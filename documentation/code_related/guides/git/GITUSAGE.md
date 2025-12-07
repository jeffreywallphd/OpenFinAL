
User Manual for Pushing Changes to `FALL2024-BA5200-TEAM#` Branch on GitHub

**Introduction to GitHub**

GitHub is a platform that allows teams to collaborate on coding projects. It uses Git, a version control system, which helps you manage changes in your project over time.

With GitHub, you can:
- Work together on projects with others.
- Track changes made to your code.
- Collaborate using branches, which are separate versions of your project.
- Push or upload your changes from your local computer to GitHub.

This guide will walk you through the steps to push your code changes to the `FALL2024-BA5200-TEAM#` branch.

**1. Setting Up Git on Your Computer**
Step 1: Install Git
If you don’t have Git installed:
- Windows: Download Git from https://git-scm.com/downloads and install it.
- macOS: Open Terminal and type `git`. If Git is not installed, you'll be prompted to install it.
- Linux: Use your package manager, e.g., `sudo apt-get install git`.

Step 2: Configure Git
After installing Git, configure your username and email:
```bash
git config --global user.name "Your Name"
git config --global user.email "youremail@example.com"
```

**2. Cloning the Repository**
Step 1: Open Terminal or Command Prompt
Use the command line to interact with Git. If you’re using:
- Windows: Open Command Prompt or Git Bash.
- macOS/Linux: Open Terminal.

Step 2: Clone the Repository
To start working on a project, you need to clone (download) the project from GitHub to your computer. Use the following command:
```bash
git clone https://github.com/jeffreywallphd/AutoProphet.git
```

**3. Working on the `FALL2024-BA5200-TEAM#` Branch**
Step 1: Check Out the `FALL2024-BA5200-TEAM#` Branch
By default, you might be on the `main` or `master` branch. To switch to the `FALL2024-BA5200-TEAM#` branch, use:
```bash
git checkout FALL2024-BA5200-TEAM#
```
This switches you to the branch where the team’s work is happening.
verify branch by using 
```bash
git branch
```
which should give you FALL2024-BA5200-TEAM# as response

Step 2: Make Your Changes
Now that you're on the `FALL2024-BA5200-TEAM#` branch, make your changes to the project files on your computer.

**4. Protecting Your Email Privacy on GitHub**

When you contribute to projects on GitHub, you might not want to expose your personal email in commit logs. GitHub offers a private email option to keep your personal email address private. Here's how you can set this up:

Step 1: Find Your GitHub Private Email
i. Go to your GitHub profile.
ii. Click on **Settings**.
iii. In the sidebar, click on **Emails**.
iv. Under the "Email Settings", you'll find a private email address that looks like `ID+username@users.noreply.github.com`. This is the email you can use to obscure your personal email.

Step 2: Setting Up Git to Use Your GitHub Private Email
i. Open your terminal or command prompt.
ii. Set your email globally for all repositories on your machine:
   ```
   git config --global user.email "ID+username@users.noreply.github.com"
   ```
   Alternatively, you can set it for a single repository by navigating to the repository directory and running:
   ```
   git config user.email "ID+username@users.noreply.github.com"
   ```

### Step 3: Confirming Your Email Settings
i. To check if your email has been set correctly in Git, you can use:
   ```
   git config user.email
   ```
   This command will display the email currently set for your Git commits.

By following these steps, you can contribute to projects without exposing your personal email address in commit logs.

**5. Committing and Pushing Changes to GitHub**
Once your changes are done, you need to save them to the GitHub repository by following these steps:

Step 1: Stage Your Changes
Before committing, you need to stage the changes. This means telling Git which files you want to include. Run:
```bash
git pull
git add .
```
First command fetches current changes on the branch so that you have what others have pushed.
second command stages all changed files. If you want to add a specific file, replace the `.` with the file path (e.g., `git add filename.py`).

Step 2: Commit Your Changes
After staging, commit the changes with a message describing what you did:
```bash
git commit -m "Added feature X or fixed bug Y"
```

Step 3: Push Your Changes
To send your changes to GitHub, use the push command:
```bash
git push origin FALL2024-BA5200-TEAM#
```
This uploads the changes to the `FALL2024-BA5200-TEAM#` branch on GitHub.

**6. Pulling Changes from GitHub**
Before you start working on new changes, it’s a good practice to pull the latest changes from the repository to make sure you're working on the most recent version of the project.

Use this command to pull updates:
```bash
git pull origin FALL2024-BA5200-TEAM#
```

**7. Common Git Commands Cheat Sheet**
Here are some common commands you’ll use while working with Git:

| Command                             | What It Does                                       |
|-------------------------------------|----------------------------------------------------|
| `git clone <repository-url>`        | Download a GitHub repository to your local machine |
| `git checkout <branch-name>`        | Switch to a branch                                 |
| `git add <file>` or `git add .`     | Stage changes (add files to the commit)            |
| `git commit -m "message"`           | Commit your changes with a message                 |
| `git push origin <branch-name>`     | Push your changes to GitHub                        |
| `git pull origin <branch-name>`     | Pull the latest changes from GitHub                |
| `git status`                        | Check the current status of your files             |

**8. Troubleshooting**
- "Permission denied" errors: If you encounter permission issues while pushing changes, you might need to set up SSH keys or authenticate using a personal access token. Refer to GitHub's documentation for guidance.
- Merge conflicts: Sometimes you might encounter a merge conflict when pushing or pulling. This happens if there are conflicting changes. Git will notify you, and you’ll need to resolve the conflict by choosing which changes to keep.


**9. Conclusion**
Now you’re ready to push your changes to the `FALL2024-BA5200-TEAM#` branch on GitHub! With GitHub and Git, you can easily collaborate with our team, track progress, and manage code changes efficiently.
