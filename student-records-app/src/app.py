from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import os

app = Flask(__name__)
CORS(app)

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

    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

    users_collection.insert_one({
        "username": username,
        "password": hashed_password.decode("utf-8") 
    })

    return jsonify({"message": "User registered successfully!"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password").encode("utf-8")

    user = users_collection.find_one({"username": username})

    if user and bcrypt.checkpw(password, user["password"].encode("utf-8")):
        return jsonify({"message": "Login successful!"}), 200
    return jsonify({"error": "Invalid credentials"}), 401

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
            "code": course["code"],
            "name": course["courseName"],
            "courseNum": str(course["courseNum"]),  # Ensure courseNum is a string
            "professor": course["prof"],
            "date": course["date"],
            "room": course["room"],
            "description": "None",  # Add a placeholder if needed
            "prerequisites": course["prereq"],
        })
    return jsonify(transformed_courses)

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

if __name__ == "__main__":
    app.run(debug=True, port=5000)