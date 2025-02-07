# Student Records App - Setup Guide

## Prerequisites

**Make sure you have the following installed on your machine:**

- Python 3
- Node.js & npm
- Git

## Getting Started

1. **Clone the Repository** (using this or GitHub Desktop whichever works)
    - ```git clone https://github.com/ryaneveson/310_Project.git```
    - ```cd 310_Project```

2. **Install Backend Dependencies**
    - Navigate to the `src` folder and install the required Python packages:
    - ```cd student-records-app```
    - ```cd src```
    - ```pip install -r requirements.txt```

3. **Start the Flask API**
    - Run the following command inside the `src` folder:
    - ```python app.py```
    - This will start the backend at http://127.0.0.1:5000.

4. **Install Frontend Dependencies**
    - Open a new terminal and navigate to the root project folder:
    - ```npm install```

5. **Start the React App**
    - Once dependencies are installed, run:
    - ```npm start```
    - This will launch the React app in the browser.

## Using the App

The React frontend will communicate with the Flask backend running on http://127.0.0.1:5000.

User authentication and student records will be stored in MongoDB Atlas.

## Troubleshooting

- If `pip install` fails, ensure Python 3 and pip are installed.
- If `npm start` fails, ensure Node.js and npm are installed.
- If the Flask API isn’t starting, check for errors in `app.py` or confirm the MongoDB Atlas connection.
