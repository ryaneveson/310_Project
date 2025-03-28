# Werkday - Setup Guide

## Overview

**Werkday** is a website that allows administrators and students to manage academic workflows, including course enrollment, grading, tuition payments, and viewing official documents.

### Current Project Status (Milestone 3 Completion - 95%)

- **Admin Functionalities:**
  - Secure login/logout with **2-factor authentication** (Completed)
  - Manage student profiles: add, edit, delete, and view details (Completed)
  - Assign students to courses (Completed)
  - Record student grades (Completed)
  - Generate detailed student reports in JSON format (Completed)
  - Search, sort, and filter students by various criteria (Completed)
  - Manage course waitlists (Completed)

- **Student Functionalities:**
  - Secure login/logout with **2-factor authentication** (Completed)
  - View and update profile information (Completed)
  - Enroll in courses and join waitlists if full (Completed)
  - View semester calendar (Completed)
  - Store financial information (Completed)
  - Make tuition payments using stored financial data (Completed)
  - View payment history (Completed)
  - Drop courses before a specific deadline (Partially Completed; functionality implemented but not yet linked to the database)

## Tech Stack

- **Frontend:** React, JavaScript, HTML, CSS
- **Backend:** Flask API (Python)
- **Database:** MongoDB Atlas
- **Security:** Password hashing, **2-factor authentication**
- **Workflow Automation:** Continuous Integration (CI/CD)

## Prerequisites

Ensure you have the following installed:

- **Docker & Docker Compose**
- **MongoDB Atlas account**
- **Git**

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ryaneveson/310_Project.git
cd 310_Project/student-records-app/src
```

### 2. Start the System

Run the following command inside the `src` folder:

```bash
docker-compose up --build
```

Wait a few moments for both the **development** and **backend** servers to start up.

## Features

### Administrator Capabilities

- **Secure Authentication:** Log in and out securely using basic user authentication with **2-factor authentication**.
- **Student Profile Management:** Add, edit, delete, and view student details, including name, ID, and contact information.
- **Course Management:** Assign students to courses if their timetable allows.
- **Grade Recording:** Record and update student grades.
- **Report Generation:** Generate detailed student reports, including enrolled courses, grades, and overall performance, exportable in JSON format.
- **Student Search and Filtering:** Search for students by attributes such as name, course, or grade range, and sort/filter students by various criteria.
- **Course Waitlists:** Add students to course waitlists when enrollment is full.

### Student Capabilities

- **Secure Authentication:** Log in and out securely using basic user authentication with **2-factor authentication**.
- **Profile Management:** View and update personal profile information, including contact details.
- **Course Enrollment:** Enroll in courses and request to be added to waitlists when enrollment is full.
- **Semester Calendar:** View a calendar representation of the semester schedule.
- **Financial Management:** Store financial information, make tuition payments using stored data, and view payment history.
- **Course Drop:** Drop courses before a specific deadline (functionality implemented but not yet linked to the database).

## Database & Security

- **Database:** Utilizes **MongoDB Atlas** for cloud-based data storage.
- **Security Measures:** Implements secure authentication with **password hashing** and **2-factor authentication**. All API endpoints include validation and authentication checks.

## Testing & Workflow Automation

- **Unit Testing:** The Flask API supports **unittest-based** testing.
- **CI/CD Pipeline:** Automates code integration and testing to ensure code quality and streamline deployment.

## Troubleshooting

- **Docker Issues:**
  - Ensure Docker is installed and running on your system.
  - If `docker-compose up --build` fails, try running `docker system prune -a` to clear all Docker images.
