from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
from datetime import datetime
import os

app = Flask(__name__)
# Simplify CORS configuration
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

MONGO_URI = "mongodb+srv://samijaffri01:6XjmdnygdfRrD8dF@cluster0.fgfo7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["student_records"]  
users_collection = db["users"]  
students_collection = db["students"] #need to connect this to students collection
courses_collection = db["Courses"]

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password").encode("utf-8")
    role = data.get("role", "student")  # default to student if not specified

    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

    users_collection.insert_one({
        "username": username,
        "password": hashed_password.decode("utf-8"),
        "role": role
    })

    return jsonify({"message": "User registered successfully!"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.json
        print("Received login request data:", data)  # Debug log
        
        username = data.get("username")
        password = data.get("password").encode("utf-8")
        
        print(f"Looking for user with username: {username}")  # Debug log
        user = users_collection.find_one({"username": username})
        print(f"Found user in database: {user}")  # Debug log

        if not user:
            print("No user found with that username")  # Debug log
            return jsonify({
                "error": "Invalid credentials",
                "success": False
            }), 401

        try:
            stored_password = user["password"].encode("utf-8")
            is_valid = bcrypt.checkpw(password, stored_password)
            print(f"Password verification result: {is_valid}")  # Debug log
            
            if is_valid:
                return jsonify({
                    "message": "Login successful!",
                    "role": user.get("role", "student"),
                    "success": True
                }), 200
            else:
                return jsonify({
                    "error": "Invalid credentials",
                    "success": False
                }), 401
                
        except Exception as e:
            print(f"Error during password verification: {str(e)}")  # Debug log
            return jsonify({
                "error": "Error verifying credentials",
                "success": False
            }), 500

    except Exception as e:
        print(f"Unexpected error in login route: {str(e)}")  # Debug log
        return jsonify({
            "error": "Server error",
            "success": False
        }), 500

#route to student profile page for a given student ID
@app.route("/submit-student-id", methods=["POST"])
def submit_student_id():
    student_id = request.form.get("studentID")
    if student_id:
        return redirect(f"/studentProfile/{student_id}")
    return jsonify({"error": "Student ID is required"}), 400

@app.route("/api/courses", methods=["GET"])
def get_courses():
    courses = list(courses_collection.find({}, {"_id": 0}))  # Exclude MongoDB _id field
    # Transform the data to match the frontend's expected schema
    transformed_courses = []
    for course in courses:
        transformed_courses.append({
            "dept": course["course_dept"],
            "name": course["course_name"],
            "courseNum": str(course["course_num"]),  # Ensure courseNum is a string
            "professor": course["prof"],
            "date": course["lecture_time"],
            "room": course["lecture_room"],
            #"description": "None",  # Add a placeholder if needed
            "prerequisites": course["prereq"],
        })
    return jsonify(transformed_courses)

@app.route("/api/student/courses", methods=["GET"])
def get_student_calendar():
    student_id = request.args.get("student_id")
    if not student_id:
        return jsonify({"error": "Student ID is required"}), 400
    student = students_collection.find_one({"student_id": student_id})
    if not student:
        return jsonify({"error": "Student not found"}), 404
    registered_course_names = student.get("registered_courses", [])
    
    courses_details = []
    for course_id in registered_course_names:
        course = courses_collection.find_one({"_id": course_id})
        
        if course:
            class_code = f"{course.get('course_dept')} {course.get('course_num')}"
            lecture_time = course.get("lecture_time", "")
            #assuming lecture_time is in format like "Mon-Wed 11:00-12:30"
            days, times = lecture_time.split(" ")
            start_time, end_time = times.split("-")
            days_list = days.split("-")
             
            for day in days_list:
                courses_details.append({
                    "day": day,
                    "startTime": start_time,
                    "endTime": end_time,
                    "classCode": class_code,
                    "room": course.get("lecture_room")
                })
    if not courses_details:
        return jsonify({"error": "No courses found for this student"}), 404
    return jsonify({"courses": courses_details}), 200

@app.route("/api/register-course", methods=["POST"])
def register_course():
    data = request.json
    student_id = data.get("student_id")
    course_name = data.get("course_name")

    if not student_id or not course_name:
        return jsonify({"error": "Student ID and course name are required"}), 400

    # Add the course to the student's registered courses
    students_collection.update_one(
        {"student_id": student_id},
        {"$push": {"registered_courses": course_name}},
        upsert=True
    )

    return jsonify({"message": "Course registered successfully!"}), 201

@app.before_request
def log_request():
    print(f"Incoming {request.method} request to {request.path}")

@app.route("/test-user", methods=["GET"])
def test_user():
    user = users_collection.find_one({})  # Gets first user
    print("Test user:", user)
    return jsonify({"user": str(user)})

if __name__ == "__main__":
    app.run(debug=True, port=5000)