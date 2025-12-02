We came up with four figma frames for our area of the software. The hope
is to eventually be able to select a company and be able to view a quick
comparison of their current ratios and their industry average of the
rations. Also to have the option to compare the companies ratios through
the years in addition to looking at a glance at a specific year. Frame 1
has a search option to look for a specific stock, once selected, Frame 2
will come up with the ratios as well as the industry average for
comparison. Frame 3 is what was started in the software at this time as
we were focusing on obtaining the proper information to get the ratios
for the company that we search and were not able to obtain the industry
average at this time.

Figma Link:
https://www.figma.com/proto/BGwVyU7P6i4O1BNh6sOcHI/10K-10Q?node-id=0-1&t=ofE93WzdO8NlEZu0-1

The screenshot below is indicating the output data of our code after
scrapping the data from the 10K of the SEC during the year from 2020
until 2025. It is important to note that column I, J, P and Q are test
columns, which are calculating and indicating the accuracy of the data.
This means that column I (Test Gross Profit) is being calculated by
subtracting column E (Revenues) from column G (Cost of Revenues). Column
J is comparing the Test Gross Profit with the extracted column H (Gross
Profit). If the data is correct it will display "0" (green). If the data
is incorrect it will display "1" (red). In column P TestIncomeLoss is
being calculated by subtracting Gross Profit from Operating Expenses.
Column Q is comparing the TestIncomeLoss with the extracted column O
(OperatingIncomeLoss). If the data is correct it will display "0"
(green). If the data is incorrect it will display "1" (red). In addition
to that column K is checking if the data for "Gross Profit" has been
extracted from the SEC. If the data has been extracted from the SEC it
will display "0'. If the data has not been extracted it displays "1".
The same process has been done for Column L, M, R, and S to check
whether Revenue, Cost of Revenue, Gross Profit, and Operating Expenses
is available or not.

Data Link:
https://docs.google.com/spreadsheets/d/1qnziXHHjAhOqXUMZad-dDJkewpnY6yWD/edit?gid=1422206056#gid=1422206056
