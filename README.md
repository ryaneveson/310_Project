# Werkday - Setup Guide

## Overview

**Werkday** is a web platform that provides administrators and students the ability to manage their academic workflows wheter that be course enrollment, grading, finances (i.e. tuition payment), or official document collection. 

### Current Project Status (Milestone 2 Completion - 60%)

- Secure login/logout with **2-factor authentication** (Completed)
- Student search by name, course, or grade (Completed)
- Sorting/filtering students by various criteria (Completed)
- Student course enrollment (Completed)
- Student semester calendar view (Completed)
- Student financial data storage (Completed)
- Secure password handling with **hashing** (Completed)
- Meaningful error messages across the app (Completed)
- MongoDB database integration (Completed)

#### Still in Progress

- Managing student profiles (CRUD operations)
- Assigning students to courses and recording grades
- Generating detailed student reports
- Course waitlist functionality
- Saving/loading student records in JSON, CSV, TXT
- Students dropping courses before a deadline

## Tech Stack

- **Frontend:** React, JavaScript, HTML, CSS
- **Backend:** Flask API (Python)
- **Database:** MongoDB Atlas
- **Security:** Password hashing, **2FA authentication**
- **Design Patterns:** Singleton (DB connection), Facade (Batch actions), Client-Server
- **Workflow Automation:** Continuous Integration (CI/CD)

## Prerequisites

Ensure you have the following installed:

- **Python 3**
- **Node.js & npm**
- **MongoDB Atlas account**
- **Git**

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ryaneveson/310_Project.git
cd 310_Project
```

### 2. Install Backend Dependencies

```bash
cd student-records-app/src
pip install -r requirements.txt
```

### 3. Start the Flask API

Ensure your MongoDB connection is set up in **`app.py`**. Then, run:

```bash
python app.py
```

The backend will run at [http://127.0.0.1:5000](http://127.0.0.1:5000).

### 4. Install Frontend Dependencies

```bash
cd ../..
npm install
```

### 5. Start the React App

```bash
npm start
```

The frontend will launch in your browser and communicate with the Flask backend.

## Features

### Administrator Capabilities

- Secure login/logout with **2FA authentication** (Completed)
- Search, sort, and filter students (Completed)
- Manage student profiles (add, edit, delete) (In Progress)
- Assign students to courses and record grades (In Progress)
- Generate student reports (export JSON, CSV, TXT) (In Progress)
- Course waitlists for full enrollment (In Progress)

### Student Capabilities

- Secure login/logout (Completed)
- Enroll in courses (Completed)
- View semester calendar (Completed)
- Store financial/payment information (Completed)
- Drop courses before deadlines (In Progress)
- Update profile information (In Progress)

## Database & Security

- Uses **MongoDB Atlas** for cloud database storage.
- Secure authentication with **password hashing and 2FA**.
- All API endpoints include validation and authentication checks.

## Testing & Workflow Automation

- **Unit Testing:** Flask API supports **unittest-based** testing.
- **CI/CD Pipeline:** Automates code integration and testing.
- **Singleton Design Pattern:** Used for **MongoDB connection handling**.
- **Facade Design Pattern:** Batch actions (e.g., adding fees to all students in a class).
- **Client-Server Architecture:** React frontend communicates with Flask backend.

## Troubleshooting

- If `pip install` fails, verify **Python 3 and pip** are installed.
- If `npm start` fails, ensure **Node.js and npm** are installed.
- If MongoDB is not connecting, check:
  - Connection string in `app.py`
  - Database permissions in **MongoDB Atlas**
