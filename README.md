# Spendrift

So you don’t become a spendthrift.

Spendrift is a full-stack expense tracking application that enables users to record, manage, and analyze their spending. The application was developed starting from a basic CRUD system and later enhanced into a structured dashboard with DOM-based navigation to improve usability.

--------------------------------------------------------------------------------------------------------------------

## Features

### Overview Dashboard

* Displays key financial insights:

  * Total expenses
  * Total number of entries
  * Highest expense
  * Current month spending
  * Top spending category
* Includes a visual representation of spending trends using charts

### Add / Edit Expenses

* Add new expense entries with:

  * Title
  * Amount
  * Category
  * Date
  * Optional description
* Edit existing entries
* Cancel edit functionality supported

### Expense Management

* View all expenses in a structured list
* Search by title, category, or description
* Sort by:

  * Newest / Oldest
  * Amount (High to Low / Low to High)
* Delete entries

### User Interface

* Single-page application using DOM-based tab navigation:

  * Overview
  * Add / Edit
  * Expenses
* Scrollable expense panel for better data handling
* Dashboard-style layout to improve clarity and reduce clutter

--------------------------------------------------------------------------------------------------------------------

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Atlas)

### Libraries

* Chart.js

--------------------------------------------------------------------------------------------------------------------

## Project Structure

Expense_Tracker/
│
├── server/
│ ├── server.js
│ ├── routes/
│ ├── models/
│
├── client/
│ ├── index.html
│ ├── style.css
│ ├── script.js
│
├── .env
├── .gitignore
├── package.json
└── README.md

--------------------------------------------------------------------------------------------------------------------

## Setup Instructions

1. Clone the repository:

git clone https://github.com/yoshithavislavath-jpg/Expense_Tracker.git
cd Expense_Tracker

2. Install dependencies:

npm install

3. Create a ".env" file:

PORT=5000
MONGO_URI=your_mongodb_connection_string

4. Run the server:

npm run dev

5. Open in browser:

http://localhost:5000

--------------------------------------------------------------------------------------------------------------------

## Challenges Faced

## Challenges Faced

### 1. Increasing Page Length
- Displaying all components on a single page led to excessive scrolling  
- The interface became cluttered as more data was added  
- **Solution:** Implemented DOM-based tab navigation to separate Overview, Add/Edit, and Expenses sections  

---

### 2. Expense List Overflow
- The expense list grew indefinitely with more entries  
- This affected layout consistency and usability  
- **Solution:** Converted the list into a scrollable container within a fixed panel  

---

### 3. CRUD Synchronization
- After create, update, or delete operations, the UI did not automatically reflect changes  
- Risk of inconsistent frontend state  
- **Solution:** Re-fetched and re-rendered expense data after every operation  

---

### 4. Edit State Management
- Using the same form for both adding and editing required handling multiple states  
- Needed a way to distinguish between create and update actions  
- **Solution:** Introduced an edit state variable and conditional logic for form behavior  

---

### 5. MongoDB Configuration Issues
- Faced issues with IP whitelisting and connection string formatting  
- Special characters in credentials caused connection errors  
- **Solution:** Updated network access settings and properly formatted the connection string  

--------------------------------------------------------------------------------------------------------------------

## Conclusion

Spendrift demonstrates a complete full-stack implementation with a focus on usability, maintainability, and clean design. The project highlights the transition from a basic CRUD application to a more structured and user-friendly dashboard system.
