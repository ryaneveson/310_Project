from flask import Flask, request, jsonify, redirect, make_response
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
from bson import ObjectId
from datetime import datetime
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure CORS
CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:3000"],
         "methods": ["GET", "POST", "PUT", "OPTIONS"],
         "allow_headers": ["Content-Type"],
         "expose_headers": ["Content-Type"],
         "supports_credentials": True
     }})


MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["student_records"]
users_collection = db["users"]
students_collection = db["students"]
courses_collection = db["Courses"]
finances_collection = db["Finances"]
payment_methods_collection = db["payment_methods"]

# Global OPTIONS handler for all routes
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 204

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    student_id = data.get("student_id")

    if not all([username, password, student_id]):
        return jsonify({"error": "Username, password, and student ID are required"}), 400

    # Check if student exists and doesn't have an account
    student = students_collection.find_one({"student_id": student_id})
    if not student:
        return jsonify({"error": "Invalid student ID"}), 404
    
    if student.get("username") or student.get("password"):
        return jsonify({"error": "Account already exists for this student"}), 400

    # Check if username is already taken by another student
    existing_user = students_collection.find_one({"username": username})
    if existing_user:
        return jsonify({"error": "Username already exists"}), 400

    # Update student record with new username and password
    try:
        students_collection.update_one(
            {"student_id": student_id},
            {"$set": {
                "username": username,
                "password": password
            }}
        )
        return jsonify({"message": "Account created successfully!"}), 201
    except Exception as e:
        return jsonify({"error": f"Error creating account: {str(e)}"}), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400

        # Find student with matching username
        student = students_collection.find_one({"username": username})

        # Simple string comparison for password
        if student and student.get("password") == password:
            return jsonify({
                "success": True,

                "role": student.get("role", "student"),
                "student_id": student.get("student_id"),
                "username": student["username"],

                "message": "Login successful"
            }), 200

        return jsonify({"success": False, "error": "Invalid credentials"}), 401

    except Exception as e:
        print("Login error:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

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
            "description": "None",  # Add a placeholder if needed
            "prerequisites": course["prereq"],
            "capacity": course["capacity"]
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
    student = students_collection.find_one({"student_id": student["_id"]}, {"_id": 0})
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
    course_capacity = data.get("course_capacity")

    if not student_id or not course_dept or not course_num:
        return jsonify({"error": "Student ID, course department, and course number are required"}), 400
    
    student = students_collection.find_one({"student_id": student_id})
    if not student:
        return jsonify({"error": "Student not found"}), 404

    # Concatenate the course department and number
    course_identifier = f"{course_dept} {course_num}"

    if course_identifier in student.get("registered_courses", []):
        return jsonify({"error": "Student is already registered for this course"}), 400
    
    if course_capacity < 150:
        # Add the course to the student's registered courses
        students_collection.update_one(
            {"student_id": student_id},
            {"$push": {"registered_courses": course_identifier}},
            upsert=True
        )

        courses_collection.update_one(
        {"course_dept": course_dept, "course_num": course_num},
        {"$inc": {"capacity": +1}}
    )
        return jsonify({"message": "Course registered successfully!"}), 201
    else:
        return jsonify({"error": "Course is full."}), 400

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

@app.route("/api/add-student", methods=["POST"])
def add_student():
    print("Adding new student...")
    # Get data from the request body
    data = request.get_json()

    # Ensure required fields are present in the request
    required_fields = ["firstname", "lastname", "email", "gender", "degree", "major"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required."}), 400
        
    # Get the next available student ID
    last_student = students_collection.find().sort("student_id", -1).limit(1)
    if last_student.alive:
        last_student_id = last_student[0]["student_id"]
    else:
        last_student_id = "10000000"
    student_id = str(int(last_student_id) + 1)

    # Create the student document with new fields
    student_doc = {
        "student_id": student_id,
        "first_name": data["firstname"],
        "last_name": data["lastname"],
        "email": data["email"],
        "gender": data["gender"],
        "registered_courses": [],
        "registered_courses_grades": [],
        "completed_courses": [],
        "completed_courses_grades": [],
        "degree": data["degree"],
        "major": data["major"],
        "username": "", 
        "password": "",  
        "role": "student"  
    }

    # Insert the student document into the MongoDB collection
    try:
        result = students_collection.insert_one(student_doc)
        return jsonify({
            "message": "Student added successfully.", 
            "student_id": student_id
        }), 201
    except Exception as e:
        return jsonify({"error": f"Error adding student: {str(e)}"}), 500
    
@app.route("/api/delete-students", methods=["POST"])
def delete_students():
    data = request.get_json()
    student_numbers = data.get("studentNumbers", [])
    if not student_numbers:
        return jsonify({"error": "No student numbers provided."}), 400
    try:
        result = students_collection.delete_many({"student_id": {"$in": student_numbers}})
        if result.deleted_count > 0:
            return jsonify({"message": f"{result.deleted_count} student(s) deleted successfully."}), 200
        else:
            return jsonify({"error": "No students found with the provided IDs."}), 404
    except Exception as e:
        return jsonify({"error": f"Error deleting students: {str(e)}"}), 500
    
@app.route("/api/edit-student", methods=["POST"])
def edit_student():
    data = request.get_json()
    if not all(key in data for key in ["student_id", "first_name", "last_name", "email", "gender", "degree", "major"]):
        return jsonify({"error": "Missing required fields"}), 400
    update_data = {
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "email": data["email"],
        "gender": data["gender"],
        "degree": data["degree"],
        "major": data["major"]
    }
    result = students_collection.update_one(
        {"student_id": str(data["student_id"])},
        {"$set": update_data}
    )
    print(update_data)
    if result.modified_count == 0:
        return jsonify({"error": "Student not found or no changes made"}), 404
    return jsonify({"message": "Student updated successfully"}), 200
    
@app.route("/api/student/studentprofile", methods=["GET"])
def get_student_profile():
    # Retrieve student
    student_id = request.args.get("student_id")
    print(f"Received student_id: '{student_id}'")
    if not student_id:
        return jsonify({"error": "Student ID is required"}), 400
    student = students_collection.find_one({"student_id": str(student_id)})
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    # Calculate GPA
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

    # Fetch course codes for registered and completed courses
    registered_course_codes = []
    completed_course_codes = []
    for course_id in registered_courses:
        try:
            course = courses_collection.find_one({"_id": ObjectId(course_id)})
            if course:
                # Check if both course_dept and course_num are available
                course_dept = course.get("course_dept", "")
                course_num = course.get("course_num", "")
                if course_dept and course_num:
                    registered_course_codes.append(f"{course_dept} {course_num}")
                else:
                    # If course_dept or course_num is missing, handle gracefully
                    registered_course_codes.append("Unknown Course")
            else:
                registered_course_codes.append("Course not found")
        except Exception as e:
            registered_course_codes.append("Invalid course ID")
            print(f"Error fetching course {course_id}: {e}")
    for course_id in completed_courses:
        try:
            course = courses_collection.find_one({"_id": ObjectId(course_id)})
            if course:
                # Check if both course_dept and course_num are available
                course_dept = course.get("course_dept", "")
                course_num = course.get("course_num", "")
                if course_dept and course_num:
                    completed_course_codes.append(f"{course_dept} {course_num}")
                else:
                    # If course_dept or course_num is missing, handle gracefully
                    completed_course_codes.append("Unknown Course")
            else:
                completed_course_codes.append("Course not found")
        except Exception as e:
            completed_course_codes.append("Invalid course ID")
            print(f"Error fetching course {course_id}: {e}")

    student_details = {
        "student_id": student.get("student_id"),
        "first_name": student.get("first_name"),
        "last_name": student.get("last_name"),
        "email": student.get("email"),
        "gender": student.get("gender"),
        "registered_courses": registered_course_codes,
        "registered_courses_grades": registered_grades,
        "completed_courses": completed_course_codes,
        "completed_courses_grades": completed_grades,
        "degree": student.get("degree"),
        "major": student.get("major"),
        "gpa": gpa
    }
    
    if student_details:
        return jsonify({"student": student_details}), 200
    return jsonify({"error": "Student details invalid"}), 404

@app.before_request
def log_request():
    print(f"Incoming {request.method} request to {request.path}")

@app.route("/test-user", methods=["GET"])
def test_user():
    user = users_collection.find_one({})  # Gets first user
    print("Test user:", user)
    return jsonify({"user": str(user)})


@app.route("/api/user/update", methods=["PUT", "OPTIONS"])
def update_username():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add('Access-Control-Allow-Methods', 'PUT')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response


    try:
        data = request.json
        current_username = data.get("currentUsername")
        new_username = data.get("newUsername")
        
        if not current_username or not new_username:
            return jsonify({"error": "Both current and new username are required"}), 400
            
        # Check if new username already exists
        if users_collection.find_one({"username": new_username}):
            return jsonify({"error": "Username already taken"}), 400
            
        # Update username in users collection
        user_result = users_collection.update_one(
            {"username": current_username},
            {"$set": {"username": new_username}}
        )
        
        # Update username in students collection if it exists
        student_result = students_collection.update_one(
            {"username": current_username},
            {"$set": {"username": new_username}}
        )
        
        if user_result.modified_count == 0:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({"message": "Username updated successfully"}), 200
    except Exception as e:
        print(f"Error updating username: {str(e)}")
        return jsonify({"error": str(e)}), 500


    student = students_collection.find_one({"student_id": student_id})
    if student:
        return jsonify(student)
    return jsonify({"error": "Student ID does not exist"}), 404

@app.route("/api/verify-student", methods=["POST"])
def verify_student():
    data = request.json
    student_id = data.get("student_id")
    
    if not student_id:
        return jsonify({"success": False, "error": "Student ID is required"}), 400
        
    # Check if student exists and doesn't have an account yet
    student = students_collection.find_one({
        "student_id": student_id,
        "username": {"$in": [None, ""]}  # Check if username is empty or doesn't exist
    })
    
    if student:
        return jsonify({
            "success": True,
            "message": "Student verified successfully"
        })
    else:
        # Check if student exists but already has an account
        existing_student = students_collection.find_one({"student_id": student_id})
        if existing_student:
            return jsonify({
                "success": False,
                "error": "An account already exists for this student"
            }), 400
        else:
            return jsonify({
                "success": False,
                "error": "Student ID not found"
            }), 404

  app.run(debug=True, host="0.0.0.0", port=5000)
