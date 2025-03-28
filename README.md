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


# Test Coverage Report

## Authentication & Access Control
- AccessControl.test.js (48 lines)
  ✓ Tests role-based access restrictions
  ✓ Basic authentication flow
  Coverage: Basic access control testing, could benefit from more edge cases

## Dashboard Components
- AcademicDashboard.test.js (41 lines)
  ✓ Tests GPA calculation
  ✓ Academic status display
  Coverage: Limited, needs more tests for resource access and error states

- Dashboard.test.js (62 lines)
  ✓ Navigation functionality
  ✓ User role verification
  Coverage: Moderate, could use more interaction testing

## Student Management
- StudentSearch.test.js (121 lines)
  ✓ Search functionality
  ✓ Filter operations
  ✓ Export capabilities
  Coverage: Good coverage of core features

- StudentProfile.test.js (193 lines)
  ✓ Profile data display
  ✓ Profile updates
  ✓ Error handling
  Coverage: Comprehensive testing of profile management

- StudentProfileInput.test.js (47 lines)
  ✓ Input validation
  Coverage: Basic input testing, needs more validation scenarios

- StudentRanking.test.js (96 lines)
  ✓ Ranking calculations
  ✓ Filter functionality
  Coverage: Good core functionality coverage

## Course Management
- Courses.test.js (129 lines)
  ✓ Course registration
  ✓ Course listing
  ✓ Prerequisites checking
  Coverage: Good coverage of course operations

- Calendar.test.js (59 lines)
  ✓ Schedule display
  Coverage: Basic calendar functionality, needs more event handling tests

- CompactCalendar.test.js (94 lines)
  ✓ Compact view rendering
  ✓ Event display
  Coverage: Good coverage of view modes

## Financial Components
- Finances.test.js (78 lines)
  ✓ Balance calculation
  ✓ Payment history
  Coverage: Core financial operations tested

- MakePayment.test.js (126 lines)
  ✓ Payment processing
  ✓ Validation
  ✓ Error handling
  Coverage: Comprehensive payment flow testing

- AddFee.test.js (129 lines)
  ✓ Fee addition
  ✓ Validation
  ✓ Error states
  Coverage: Good coverage of fee management

- PaymentHistory.test.js (94 lines)
  ✓ Transaction history
  ✓ Filtering
  Coverage: Good historical data handling

- AddPaymentMethod.test.js (75 lines)
  ✓ Payment method addition
  ✓ Validation
  Coverage: Basic payment method management

## Academic Records
- StudentGrades.test.js (108 lines)
  ✓ Grade display
  ✓ GPA calculation
  Coverage: Good coverage of grade management

- UpcomingDue.test.js (109 lines)
  ✓ Due date display
  ✓ Notification testing
  Coverage: Good coverage of deadline management

## User Management
- CreateUser.test.js (87 lines)
  ✓ User creation
  ✓ Validation
  Coverage: Basic user creation flow

- ManageStudents.test.js (121 lines)
  ✓ Student CRUD operations
  ✓ Bulk operations
  Coverage: Good administrative function coverage

## Areas Needing Additional Coverage:
1. Edge Cases:
   - Invalid data handling
   - Concurrent operations

2. Integration Testing:
   - Component interactions
   - Data flow between components

3. Performance Testing:
   - Large data set handling (semi irrelevant as this is just a test project) 
   - Response time, and resource usage (again, would be helpful if this was real software so this is overlooked for now) 

## Overall Coverage Statistics:
- Total Test Files: 21
- Total Test Lines: 1,695
- Component Coverage: Good
- Functionality Coverage: Moderate to Good
- Error Handling Coverage: Should Be Improvemed

<img width="496" alt="Screenshot 2025-03-27 at 11 50 05 PM" src="https://github.com/user-attachments/assets/32362a1d-fbcc-455b-b90f-461f8efe824d" />
