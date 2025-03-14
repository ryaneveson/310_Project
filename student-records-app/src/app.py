from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
from bson import ObjectId
from datetime import datetime
import os

app = Flask(__name__)

# Remove any existing CORS configuration and use this simple setup
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

@app.route("/login", methods=['OPTIONS'])
def handle_options():
    return jsonify({}), 200

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["student_records"]
users_collection = db["users"]
students_collection = db["students"]
courses_collection = db["Courses"]
finances_collection = db["Finances"]
payment_methods_collection = db["payment_methods"]

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

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        print("Received login request:", data)
        
        if not data:
            return jsonify({"error": "No data received"}), 400
            
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400

        print(f"Looking for user: {username}")
        user = users_collection.find_one({"username": username})
        print(f"Found user: {user}")

        if user and bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
            return jsonify({
                "success": True,
                "role": "student",
                "message": "Login successful"
            }), 200
        
        return jsonify({
            "success": False,
            "error": "Invalid credentials"
        }), 401

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
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

@app.route("/api/student/finances", methods=["GET"])
def get_students_finances():
    student_id = request.args.get("student_id")
    if not student_id:
        return jsonify({"error": "Student ID is required"}), 400
    if len(student_id) != 8 or not student_id.isdigit():
        return jsonify({"error": "Student ID must be an 8-digit number"}), 400
    student = students_collection.find_one({"student_id": student_id})
    if not student:
        return jsonify({"error": "Student not found"}), 404
    finances = list(finances_collection.find({"student_id": student["_id"]}, {"_id": 0}))
    if not finances:
        return jsonify({"error": "No financial records for this student"}), 404
    finance_details = []
    for finance in finances:
        finance_details.append({
            "item_name": finance.get("item_name"),
            "amount": float(finance.get("amount", -1)),
            "due_date": finance.get("due_date"),
            "is_paid": finance.get("is_paid")
        })
    if not finance_details:
        return jsonify({"error": "No financial records for this student"}), 404
    return jsonify({"finances": finance_details}), 200

@app.route("/api/student/payment_methods", methods=["GET"])
def get_students_payment_methods():
    student_id = request.args.get("student_id")
    if not student_id:
        return jsonify({"error": "Student ID is required"}), 400
    if len(student_id) != 8 or not student_id.isdigit():
        return jsonify({"error": "Student ID must be an 8-digit number"}), 400
    student = students_collection.find_one({"student_id": student_id})
    if not student:
        return jsonify({"error": "Student not found"}), 404
    payment_methods = list(payment_methods_collection.find({"student_id": student["_id"]}, {"_id": 0}))
    if not payment_methods:
        return jsonify({"error": "No payment methods for this student"}), 404
    payment_details = []
    for method in payment_methods:
        payment_details.append({
            "card_type": method.get("card_type"),
            "card_number": method.get("card_number"),
            "card_name": method.get("card_name"),
            "card_address": method.get("card_address"),
            "expiry_date": method.get("expiry_date"),
            "cvv": method.get("cvv")
        })
    if not payment_details:
        return jsonify({"error": "No payment methods for this student"}), 404
    return jsonify({"payment_methods": payment_details}), 200

@app.route("/api/student", methods=["GET"])
def get_students_studentSearch():
    students = list(students_collection.find({}, {"_id": 0}))
    if not students:
        return jsonify({"error": "No students found"}), 404
    student_details = []
    for student in students:
        registered_grades = student.get("registered_courses_grades", [])
        completed_grades = student.get("completed_courses_grades", [])
        all_grades = registered_grades + completed_grades
        all_grades_int = [int(grade) for grade in all_grades]
        if all_grades_int:
            gpa = sum(all_grades_int) / len(all_grades_int)
        else:
            gpa = 0
        registered_courses = student.get("registered_courses", [])
        completed_courses = student.get("completed_courses", [])
        all_course_ids = registered_courses + completed_courses
        course_codes = []
        for course_id in all_course_ids:
            try:
                course = courses_collection.find_one({"_id": ObjectId(course_id)})
                if course:
                    # Check if both course_dept and course_num are available
                    course_dept = course.get("course_dept", "")
                    course_num = course.get("course_num", "")
                    if course_dept and course_num:
                        course_codes.append(f"{course_dept} {course_num}")
                    else:
                        # If course_dept or course_num is missing, handle gracefully
                        course_codes.append("Unknown Course")
                else:
                    course_codes.append("Course not found")
            except Exception as e:
                course_codes.append("Invalid course ID")
                print(f"Error fetching course {course_id}: {e}")
        student_details.append({
            "name": student.get("first_name"),
            "lastName": student.get("last_name"),
            "studentNumber": student.get("student_id"),
            "gpa": gpa,
            "classes": course_codes
        })
    if not student_details:
        return jsonify({"error": "No students found"}), 404
    return jsonify({"students": student_details}), 200

@app.route("/api/register-course", methods=["POST"])
def register_course():
    data = request.json
    student_id = data.get("student_id")
    course_dept = data.get("course_dept")
    course_num = data.get("course_num")

    if not student_id or not course_dept or not course_num:
        return jsonify({"error": "Student ID, course department, and course number are required"}), 400

    # Concatenate the course department and number
    course_identifier = f"{course_dept} {course_num}"

    # Add the course to the student's registered courses
    students_collection.update_one(
        {"student_id": student_id},
        {"$push": {"registered_courses": course_identifier}},
        upsert=True
    )

    return jsonify({"message": "Course registered successfully!"}), 201

@app.route("/api/add-payment", methods=["POST"])
def add_payment():
    data = request.json
    student_id = data.get("student_id")
    amount = data.get("amount")
    due_date = data.get("due_date")
    is_paid = data.get("is_paid")
    if not student_id:
        return jsonify({"error": "Student ID is required"}), 400
    if not amount or not due_date or not is_paid:
        return jsonify({"error": "Data for payment not provided"}), 400
    if len(student_id) != 8 or not student_id.isdigit():
        return jsonify({"error": "Student ID must be an 8-digit number"}), 400
    try:
        due_date_obj = datetime.strptime(due_date, "%Y-%m-%d")  # Assuming input format "YYYY-MM-DD"
    except ValueError:
        return jsonify({"error": "Invalid due_date format. Use YYYY-MM-DD."}), 400
    student = students_collection.find_one({"studentNumber": student_id})
    if not student:
        return jsonify({"error": "Student not found"}), 404
    student_object_id = student["_id"]
    new_payment = {
        "student_id": student_object_id,
        "item_name": "payment",
        "amount": amount,
        "due_date": due_date_obj,
        "is_paid": bool(is_paid)
    }
    finances_collection.insert_one(new_payment)
    return jsonify({"message": "Payment record added successfully"}), 201
    
@app.route("/api/add-fee", methods=["POST"])
def add_fee():
    data = request.json
    students_data = data.get("students")
    
    if not students_data:
        return jsonify({"error": "Students data is required"}), 400
    
    for student_data in students_data:
        student_id = student_data.get("student_id")
        item_name = student_data.get("item_name")
        amount = student_data.get("amount")
        due_date = student_data.get("due_date")
        
        if not student_id:
            return jsonify({"error": "Student ID is required"}), 400
        if not amount or not due_date or not item_name:
            return jsonify({"error": "Data for payment not provided"}), 400
        if len(student_id) != 8 or not student_id.isdigit():
            return jsonify({"error": "Student ID must be an 8-digit number"}), 400
        try:
            due_date_obj = datetime.strptime(due_date, "%Y-%m-%d")  # Assuming input format "YYYY-MM-DD"
        except ValueError:
            return jsonify({"error": "Invalid due_date format. Use YYYY-MM-DD."}), 400
        
        student = students_collection.find_one({"student_id": str(student_id)})
        if not student:
            return jsonify({"error": f"Student with ID {student_id} not found"}), 404
        
        student_object_id = student["_id"]
        new_fee = {
            "student_id": student_object_id,
            "item_name": item_name,
            "amount": amount,
            "due_date": due_date_obj,
            "is_paid": False
        }
        
        result = finances_collection.insert_one(new_fee)
        print(f"Inserted fee for student {student_id} with ID: {result.inserted_id}")

    return jsonify({"message": "Fees added successfully for selected students."}), 201
    

@app.before_request
def log_request():
    print(f"Incoming {request.method} request to {request.path}")

@app.route("/test-user", methods=["GET"])
def test_user():
    user = users_collection.find_one({})  # Gets first user
    print("Test user:", user)
    return jsonify({"user": str(user)})

if __name__ == "__main__":
  app.run(debug=True, host="0.0.0.0", port=5000)

@app.route("/api/student/studentprofile", methods=["GET"])
def get_student_profile():
    student_id = request.args.get("student_id")
    if not student_id:
        return jsonify({"error": "Student ID is required"}), 400

    student = students_collection.find_one({"student_id": student_id})
    if student:
        return jsonify(student)
    return jsonify({"error": "Student ID does not exist"}), 404
    
