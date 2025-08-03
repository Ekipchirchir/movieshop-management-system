Movie Shop Management Dashboard (Frontend)
Overview
A user-friendly interface for recording sales, managing customers, viewing real-time analytics, and exporting reports. It integrates with a Node.js/MongoDB backend using JWT authentication for secure access.
<img width="1920" height="1080" alt="Screenshot (107)" src="https://github.com/user-attachments/assets/158e98e8-99bc-42bf-9619-d998013d3a45" />

Features

Authentication: Login system with JWT-based authentication.
Sales Management: Record sales for movies, PlayStation rentals/games, and Wi-Fi vending.
Customer Management: Add and search customer details (required for PlayStation rentals).
Dashboard: Visualize sales data with KPI cards (total sales, top entity, customer count, average sale), bar/pie/line charts, and a recent sales table. Supports filtering by period, entity, and date range.
Reports: Export sales data as CSV with customizable filters.
Real-Time Updates: Polls the backend every 30 seconds for live data.
Error Handling: Robust error boundaries and user-friendly error messages.

Prerequisites

Node.js (v14 or later)
npm (v6 or later)
Backend Server: The Node.js backend must be running (see backend repository for setup).
MongoDB: A running MongoDB instance (local or hosted).
Browser: Modern browser (Chrome, Firefox, Edge) for development and testing.

Setup Instructions

Clone the Repository:
git clone <frontend-repository-url>
cd movie-shop-frontend


Install Dependencies:
npm install

Required packages:

react, react-dom: Core React libraries.
react-chartjs-2, chart.js: For rendering bar, pie, and line charts.
No additional setup is needed for inline CSS (styles are embedded in components).


Configure Environment:

The frontend assumes the backend is running at http://localhost:5000. Update API URLs in components (Login.js, Dashboard.js, etc.) if the backend is hosted elsewhere (e.g., Heroku).
Ensure the backend has a valid JWT_SECRET and MongoDB connection (MONGO_URI).


Run the Application:
npm start


The app will start at http://localhost:3000.
Open this URL in your browser to access the dashboard.



Usage

Login:

Navigate to http://localhost:3000.
Enter credentials (e.g., username: admin, password: securepassword123).
If no user exists, register one via the backend:curl -X POST http://localhost:5000/api/register -H "Content-Type: application/json" -d '{"username":"admin","password":"securepassword123"}'




Dashboard:

View KPIs (total sales, top entity, customer count, average sale).
Filter data by period (daily, weekly, monthly, yearly), entity (movie, PlayStation game/rental, Wi-Fi), or date range.
Export filtered data as CSV using the "Export CSV" button.
Charts and tables update every 30 seconds.


Record Sales:

Go to the "Record Sale" tab.
Select an entity and enter the amount. For PlayStation rentals, provide customer details (ID number, name, address).


Manage Customers:

Use the "Add Customer" tab to add new customers.
Search customers in the "Customer List" tab.


Reports:

Access the "Reports" tab to view and export sales data.


Logout:

Click the "Logout" button to clear the JWT and return to the login page.



File Structure
movie-shop-frontend/
├── src/
│   ├── App.js              # Main app component with navigation and routing
│   ├── Login.js            # Login form with JWT authentication
│   ├── Dashboard.js        # Dashboard with KPIs, charts, and sales table
│   ├── SalesForm.js        # Form to record sales
│   ├── CustomerForm.js     # Form to add customers
│   ├── CustomerList.js     # Customer search and list
│   ├── Reports.js          # Sales report and export functionality
│   ├── ErrorBoundary.js    # Error boundary for handling component errors
│   ├── index.js            # Entry point for React
│   ├── index.css           # Global styles (minimal, as inline CSS is used)
├── public/
│   ├── index.html          # HTML template
│   ├── favicon.ico         # App favicon
├── package.json            # Dependencies and scripts
├── README.md               # This file

Dependencies

React: ^17.0.2 or later for building the UI.
react-chartjs-2: ^4.0.0 for charts (bar, pie, line).
chart.js: ^3.7.0 for chart rendering.
Install dependencies:npm install react react-dom react-chartjs-2 chart.js



Error Handling

401 Unauthorized: Automatically refreshes the JWT token or redirects to login if invalid.
Data Errors: Handles non-array API responses (e.g., reduce is not a function) with fallback to empty arrays.
Error Boundary: Wraps components to display user-friendly error messages.
Debugging: Open browser DevTools (F12) to check Network tab for API requests and Console for logs (e.g., token details).

Testing

Local Testing:

Ensure the backend is running (http://localhost:5000).
Add sample data via the Sales page or MongoDB:db.sales.insertOne({ entity: "movie", amount: 200, date: new Date() });


Test login, dashboard filters, chart rendering, and CSV export.


Debugging:

Check console logs for token issues (Token sent: ... in Dashboard.js).
Verify API responses in the Network tab.
Inspect MongoDB (db.sales.find().pretty()) for data issues.



Deployment

Build the Frontend:
npm run build


Outputs a build/ folder for deployment.


Deploy:

Host on Vercel, Netlify, or similar platforms.
Update API URLs in components to point to the deployed backend (e.g., https://movie-shop-backend.herokuapp.com).
Ensure CORS is enabled on the backend.


Production Notes:

Use HTTPS to secure JWT transmission.
Secure the backend JWT_SECRET in environment variables.
Monitor API performance and add rate limiting.



Known Issues and Fixes

401 Unauthorized: Ensure the token is stored in localStorage after login. Check backend logs for JWT issues.
TypeError: reduce/map is not a function: Fixed by validating API responses and setting default empty arrays.
No Data Displayed: Add sample sales data or check MongoDB connection.

Future Enhancements

WebSockets: Replace polling with socket.io for real-time updates.
Advanced Filters: Add customer-specific or amount-based filters.
Additional Charts: Include heatmaps or customer demographics.
User Roles: Support admin and cashier roles for access control.
Password Reset: Add a forgot password feature.

Contributing

Submit issues or pull requests to the repository.
Ensure code follows inline CSS conventions and maintains JWT authentication.

License
This project is licensed under the MIT License.
Contact
For support or inquiries, contact the development team at [your-email@example.com].

Generated on August 4, 2025
