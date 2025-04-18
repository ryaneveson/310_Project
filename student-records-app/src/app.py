from flask import Flask, request, jsonify, redirect, make_response, send_file
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
from bson import ObjectId
from datetime import datetime
from flask_cors import CORS
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
    return response

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["student_records"]
students_collection = db["students"]
courses_collection = db["Courses"]
finances_collection = db["Finances"]
payment_methods_collection = db["payment_methods"]

def get_student_by_id(student_id):
    if not student_id:
        return None, "Student ID is required"
    
    student = students_collection.find_one({"student_id": str(student_id)})
    if not student:
        return None, "Student not found"
        
    return student, None

def process_course_list(courses, grades=None):
    processed_courses = []
    for i, course in enumerate(courses):
        if isinstance(course, str):
            processed_courses.append(course)
        else:
            try:
                course_doc = courses_collection.find_one({"_id": ObjectId(str(course))})
                if course_doc:
                    processed_courses.append(f"{course_doc.get('course_dept')} {course_doc.get('course_num')}")
                else:
                    processed_courses.append("Unknown Course")
            except:
                processed_courses.append("Invalid Course")
    
    return processed_courses

def calculate_student_fees(student):
    registered_courses = student.get("registered_courses", [])
    total_fees = len(registered_courses) * 600
    current_paid = student.get("paid", 0)
    return {
        "fees": total_fees,
        "paid": current_paid,
        "remaining": total_fees - current_paid
    }

@app.route("/login", methods=['OPTIONS'])
def handle_options():
    return jsonify({}), 200

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    student_id = data.get("student_id")

    if not all([username, password, student_id]):
        return jsonify({"error": "All fields are required"}), 400

    existing_user = students_collection.find_one({"username": username})
    if existing_user:
        return jsonify({"error": "Username already exists"}), 400

    try:
        result = students_collection.update_one(
            {"student_id": str(student_id)},
            {
                "$set": {
                    "username": username,
                    "password": password,
                    "role": "student"
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({"error": "Student not found"}), 404

        return jsonify({"message": "User registered successfully!"}), 201

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({"error": str(e)}), 500

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
        user = students_collection.find_one({"username": username})
        print(f"Found user: {user}")

        if user and user["password"] == password:
            return jsonify({
                "success": True,
                "role": user["role"],
                "username": username,
                "student_id": user.get("student_id"),
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

@app.route("/submit-student-id", methods=["POST"])
def submit_student_id():
    student_id = request.form.get("studentID")
    if student_id:
        return redirect(f"/studentProfile/{student_id}")
    return jsonify({"error": "Student ID is required"}), 400

@app.route("/api/courses", methods=["GET"])
def get_courses():
    courses = list(courses_collection.find({}))
    transformed_courses = []
    for course in courses:
        transformed_courses.append({
            "id": str(course["_id"]),
            "dept": course["course_dept"],
            "name": course["course_name"],
            "courseNum": str(course["course_num"]),
            "professor": course["prof"],
            "date": course["lecture_time"],
            "room": course["lecture_room"],
            "description": "None",
            "prerequisites": course["prereq"],
            "capacity": course["capacity"],
            "waitlist": course["waitlist"]
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
    
    registered_courses = student.get("registered_courses", [])
    courses_details = []

    for course_entry in registered_courses:
        if isinstance(course_entry, str):
            dept, num = course_entry.split()
            course = courses_collection.find_one({
                "course_dept": dept,
                "course_num": num
            })
        else:
            try:
                course = courses_collection.find_one({"_id": ObjectId(str(course_entry))})
            except:
                course = None

        if course:
            class_code = f"{course.get('course_dept')} {course.get('course_num')}"
            lecture_time = course.get("lecture_time", "")
            
            try:
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
            except:
                print(f"Error parsing lecture time for course: {class_code}")
                continue

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
    payment_details = [
        {
            "card_type": method.get("card_type"),
            "card_number": method.get("card_number"),
            "card_name": method.get("card_name"),
            "card_address": method.get("card_address"),
            "expiry_date": method.get("expiry_date"),
            "cvv": method.get("cvv")
        }
        for method in payment_methods
    ]
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
        all_grades_int = [int(grade) for grade in all_grades if grade and str(grade).isdigit()]
        gpa = sum(all_grades_int) / len(all_grades_int) if all_grades_int else 0

        registered_courses = student.get("registered_courses", [])
        completed_courses = student.get("completed_courses", [])
        all_course_ids = registered_courses + completed_courses
        course_codes = []

        for course_id in all_course_ids:
            if isinstance(course_id, str):
                course_codes.append(course_id)
            else:
                try:
                    course = courses_collection.find_one({"_id": ObjectId(str(course_id))})
                    if course:
                        course_dept = course.get("course_dept", "")
                        course_num = course.get("course_num", "")
                        if course_dept and course_num:
                            course_codes.append(f"{course_dept} {course_num}")
                        else:
                            course_codes.append("Unknown Course")
                except Exception as e:
                    print(f"Error fetching course {course_id}: {e}")
                    continue

        student_details.append({
            "name": student.get("first_name"),
            "lastName": student.get("last_name"),
            "studentNumber": student.get("student_id"),
            "major": student.get("major", "Undeclared"),
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
    course_id = data.get("course_id")
    course_dept = data.get("course_dept")
    course_num = data.get("course_num")
    course_capacity = data.get("course_capacity")
    lecture_time = data.get("lecture_time")

    if not student_id or not course_dept or not course_num:
        return jsonify({"error": "Student ID, course department, and course number are required"}), 400

    student = students_collection.find_one({"student_id": student_id})
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    course = courses_collection.find_one({
            "course_dept": course_dept,
            "course_num": course_num
        })        
    if not course:
        return jsonify({"error": "Course not found"}), 404

    StudentRegisteredCourses = student.get("registered_courses", [])
    StudentRegisteredLectureTime = []

    if ObjectId(course_id) in StudentRegisteredCourses:
        return jsonify({"error": "Student is already registered for this course"}), 400

    for courses in StudentRegisteredCourses:
        RegisteredCourse = courses_collection.find_one({"_id": ObjectId(courses)})
        StudentRegisteredLectureTime.append(RegisteredCourse["lecture_time"])

    if course_capacity < 150:
        if lecture_time in StudentRegisteredLectureTime:
             return jsonify({"error": "Course conflicts in timetable."}), 400
        else:
            students_collection.update_one(
                {"student_id": student_id},
                {"$push": {"registered_courses": ObjectId(course_id)}},
                upsert=True
            )
            courses_collection.update_one(
                    {"_id": ObjectId(course_id)},
                    {"$inc": {"capacity": +1}}
                )
            return jsonify({"message": "Course registered successfully!"}), 201
    else:            
        waitlist = course.get("waitlist", [])
        
        if student_id in waitlist:
            return jsonify({"error": "Student is already on the waitlist for this course"}), 400
            
        if len(waitlist) < 5:
            courses_collection.update_one(
                {"course_dept": course_dept, "course_num": course_num},
                {"$push": {"waitlist": student_id}}
            )
            return jsonify({"message": "Course is full. You have been added to the waitlist."}), 202
        else:
            return jsonify({"error": "Course is full and waitlist is at maximum capacity."}), 400

    
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
            due_date_obj = datetime.strptime(due_date, "%Y-%m-%d")  
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
    print("hellow world")
    data = request.get_json()

    required_fields = ["firstname", "lastname", "email", "gender", "degree", "major"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required."}), 400
        
    last_student = students_collection.find().sort("student_id", -1).limit(1)
    if last_student.alive:
        last_student_id = last_student[0]["student_id"]
    else:
        last_student_id = "10000000"
    student_id = str(int(last_student_id) + 1)

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
        "major": data["major"]
    }

    try:
        result = students_collection.insert_one(student_doc)
        return jsonify({"message": "Student added successfully.", "student_id": student_id}), 201
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
    student_id = request.args.get("student_id")
    student, error = get_student_by_id(student_id)
    
    if error:
        return jsonify({"error": error}), 400 if "required" in error else 404
    
    registered_grades = student.get("registered_courses_grades", [])
    completed_grades = student.get("completed_courses_grades", [])
    all_grades = registered_grades + completed_grades
    all_grades_int = [int(grade) for grade in all_grades if grade]
    gpa = sum(all_grades_int) / len(all_grades_int) if all_grades_int else 0
    
    registered_courses = process_course_list(student.get("registered_courses", []))
    completed_courses = process_course_list(student.get("completed_courses", []))

    student_details = {
        "student_id": student.get("student_id"),
        "first_name": student.get("first_name"),
        "last_name": student.get("last_name"),
        "email": student.get("email"),
        "gender": student.get("gender"),
        "registered_courses": registered_courses,
        "registered_courses_grades": registered_grades,
        "completed_courses": completed_courses,
        "completed_courses_grades": completed_grades,
        "degree": student.get("degree"),
        "major": student.get("major"),
        "gpa": gpa
    }
    
    return jsonify({"student": student_details}), 200

@app.before_request
def log_request():
    print(f"Incoming {request.method} request to {request.path}")

@app.route("/test-user", methods=["GET"])
def test_user():
    user = students_collection.find_one({})  
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
        new_info = data.get("newInfo", {})
        
        if not current_username or not new_info:
            return jsonify({"error": "Current username and new information are required"}), 400
            
        if new_info.get("username") != current_username and \
           students_collection.find_one({"username": new_info.get("username")}):
            return jsonify({"error": "Username already taken"}), 400
            
        update_data = {
            "username": new_info.get("username"),
            "first_name": new_info.get("first_name"),
            "last_name": new_info.get("last_name"),
            "email": new_info.get("email"),
            "gender": new_info.get("gender")
        }
        
        if new_info.get("password"):
            update_data["password"] = new_info["password"]
        
        result = students_collection.update_one(
            {"username": current_username},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({"message": "Information updated successfully"}), 200
    except Exception as e:
        print(f"Error updating user information: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/generate-transcript", methods=["GET"])
def generate_transcript():
    student_id = request.args.get("student_id")
    if not student_id:
        return jsonify({"error": "Student ID is required"}), 400

    student = students_collection.find_one({"student_id": str(student_id)})
    if not student:
        return jsonify({"error": "Student not found"}), 404

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    elements.append(Paragraph(f"Academic Transcript", styles['Title']))
    elements.append(Paragraph(f"Student: {student.get('first_name', '')} {student.get('last_name', '')}", styles['Normal']))
    elements.append(Paragraph(f"Student ID: {student_id}", styles['Normal']))
    elements.append(Paragraph(f"Major: {student.get('major', '')}", styles['Normal']))
    elements.append(Spacer(1, 20))

    registered_courses = student.get("registered_courses", [])
    registered_grades = student.get("registered_courses_grades", [])
    
    if registered_courses:
        elements.append(Paragraph("Current Courses", styles['Heading2']))
        data = [["Course", "Grade"]]
        
        for i, course in enumerate(registered_courses):
            course_name = ""
            if isinstance(course, str):
                course_name = course
            else:
                try:
                    course_doc = courses_collection.find_one({"_id": ObjectId(str(course))})
                    if course_doc:
                        course_name = f"{course_doc.get('course_dept')} {course_doc.get('course_num')}"
                    else:
                        course_name = "Unknown Course"
                except:
                    course_name = "Invalid Course"
            
            grade = registered_grades[i] if i < len(registered_grades) else "N/A"
            data.append([course_name, grade])
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)
        elements.append(Spacer(1, 20))

    completed_courses = student.get("completed_courses", [])
    completed_grades = student.get("completed_courses_grades", [])
    
    if completed_courses:
        elements.append(Paragraph("Completed Courses", styles['Heading2']))
        data = [["Course", "Grade"]]
        
        for i, course in enumerate(completed_courses):
            course_name = ""
            if isinstance(course, str):
                course_name = course
            else:
                try:
                    course_doc = courses_collection.find_one({"_id": ObjectId(str(course))})
                    if course_doc:
                        course_name = f"{course_doc.get('course_dept')} {course_doc.get('course_num')}"
                    else:
                        course_name = "Unknown Course"
                except:
                    course_name = "Invalid Course"
            
            grade = completed_grades[i] if i < len(completed_grades) else "N/A"
            data.append([course_name, grade])
        
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)

    doc.build(elements)
    buffer.seek(0)
    
    return send_file(
        buffer,
        download_name=f'transcript_{student_id}.pdf',
        as_attachment=True,
        mimetype='application/pdf'
    )

@app.route("/api/update-student-fees", methods=["POST"])
def update_student_fees():
    student_id = request.args.get("student_id")
    student, error = get_student_by_id(student_id)
    
    if error:
        return jsonify({"error": error}), 400 if "required" in error else 404

    finance_info = calculate_student_fees(student)
    
    students_collection.update_one(
        {"student_id": str(student_id)},
        {"$set": {
            "fees": finance_info["fees"],
            "paid": finance_info["paid"]
        }}
    )

    return jsonify(finance_info), 200

@app.route("/api/make-payment", methods=["POST"])
def make_payment():
    try:
        data = request.json
        student_id = data.get("student_id")
        student, error = get_student_by_id(student_id)
        print(f"Student data: {student}")

        
        if error:
            return jsonify({"error": error}), 400 if "required" in error else 404

        payment_amount = float(data.get("amount"))
        payment_method = data.get("payment_method")

        payment_record = {
            "student_id": student["_id"],
            "item_name": "payment",
            "amount": payment_amount,
            "payment_method": payment_method,
            "due_date": datetime.now(),
            "is_paid": True
        }
        finances_collection.insert_one(payment_record)

        return jsonify({
            "message": "Payment processed successfully"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/initialize-all-student-fees", methods=["POST"])
def initialize_all_student_fees():
    try:
        students = students_collection.find({})
        
        for student in students:
            registered_courses = student.get("registered_courses", [])
            total_fees = len(registered_courses) * 600
            
            students_collection.update_one(
                {"_id": student["_id"]},
                {
                    "$set": {
                        "fees": total_fees,
                        "paid": student.get("paid", 0)
                    }
                }
            )
        
        return jsonify({"message": "All student fees initialized successfully"}), 200
    except Exception as e:
        print(f"Error initializing student fees: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/update-grades", methods=["POST"])
def update_grades():
    try:
        data = request.json
        student_id = data.get("student_id")
        registered_grades = data.get("registered_courses_grades", [])
        completed_grades = data.get("completed_courses_grades", [])

        if not student_id:
            return jsonify({"error": "Student ID is required"}), 400

        student = students_collection.find_one({"student_id": str(student_id)})
        if not student:
            return jsonify({"error": "Student not found"}), 404

        if len(registered_grades) != len(student.get("registered_courses", [])) or \
           len(completed_grades) != len(student.get("completed_courses", [])):
            return jsonify({"error": "Number of grades doesn't match number of courses"}), 400

        update_data = {
            "registered_courses_grades": registered_grades,
            "completed_courses_grades": completed_grades
        }

        result = students_collection.update_one(
            {"student_id": str(student_id)},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            return jsonify({"error": "No changes made"}), 400

        return jsonify({"message": "Grades updated successfully"}), 200

    except Exception as e:
        print(f"Error updating grades: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/generate-student-report", methods=["GET"])
def generate_student_report():
    student_ids = request.args.get("student_ids", "").split(",")
    if not student_ids:
        return jsonify({"error": "No student IDs provided"}), 400

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    styles['Title'].fontName = 'Helvetica-Bold'
    styles['Normal'].fontName = 'Helvetica'
    styles['Heading1'].fontName = 'Helvetica-Bold'
    styles['Heading2'].fontName = 'Helvetica-Bold'

    elements.append(Paragraph("Student Report", styles['Title']))
    elements.append(Spacer(1, 20))

    for student_id in student_ids:
        student = students_collection.find_one({"student_id": student_id})
        if not student:
            continue

        elements.append(Paragraph(f"Student: {student.get('first_name', '')} {student.get('last_name', '')}", styles['Heading1']))
        elements.append(Paragraph(f"ID: {student_id}", styles['Normal']))
        elements.append(Paragraph(f"Major: {student.get('major', '')}", styles['Normal']))
        elements.append(Spacer(1, 10))

        registered_courses = student.get("registered_courses", [])
        registered_grades = student.get("registered_courses_grades", [])
        
        if registered_courses:
            elements.append(Paragraph("Registered Courses", styles['Heading2']))
            data = [["Course", "Grade"]]
            
            for i, course in enumerate(registered_courses):
                course_name = ""
                if isinstance(course, str):
                    course_name = course
                else:
                    try:
                        course_doc = courses_collection.find_one({"_id": ObjectId(str(course))})
                        if course_doc:
                            course_name = f"{course_doc.get('course_dept')} {course_doc.get('course_num')}"
                        else:
                            course_name = "Unknown Course"
                    except:
                        course_name = "Invalid Course"
                
                grade = registered_grades[i] if i < len(registered_grades) else "N/A"
                data.append([course_name, str(grade)])  # Convert grade to string
            
            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),  # Use Helvetica for all cells
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(table)
            elements.append(Spacer(1, 10))

        completed_courses = student.get("completed_courses", [])
        completed_grades = student.get("completed_courses_grades", [])
        
        if completed_courses:
            elements.append(Paragraph("Completed Courses", styles['Heading2']))
            data = [["Course", "Grade"]]
            
            for i, course in enumerate(completed_courses):
                course_name = ""
                if isinstance(course, str):
                    course_name = course
                else:
                    try:
                        course_doc = courses_collection.find_one({"_id": ObjectId(str(course))})
                        if course_doc:
                            course_name = f"{course_doc.get('course_dept')} {course_doc.get('course_num')}"
                        else:
                            course_name = "Unknown Course"
                    except:
                        course_name = "Invalid Course"
                
                grade = completed_grades[i] if i < len(completed_grades) else "N/A"
                data.append([course_name, grade])
            
            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(table)

        all_grades = registered_grades + completed_grades
        all_grades_int = [int(grade) for grade in all_grades if grade and str(grade).isdigit()]
        gpa = sum(all_grades_int) / len(all_grades_int) if all_grades_int else 0
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f"Current GPA: {gpa:.2f}", styles['Normal']))
        elements.append(Spacer(1, 20))

    doc.build(elements)
    buffer.seek(0)
    
    return send_file(
        buffer,
        download_name=f'student_report_{datetime.now().strftime("%Y%m%d")}.pdf',
        as_attachment=True,
        mimetype='application/pdf'
    )

@app.route("/createUser", methods=["POST", "OPTIONS"])
def verify_new_user():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    try:
        data = request.json
        student_id = data.get("student_id")
        
        if not student_id:
            return jsonify({"error": "Student ID is required"}), 400

        student = students_collection.find_one({"student_id": str(student_id)})
        
        if not student:
            return jsonify({"error": "Student not found"}), 404
            
        if student.get("username"):
            return jsonify({"error": "Student already has an account"}), 400

        return jsonify({
            "success": True,
            "message": "Student verified successfully"
        }), 200

    except Exception as e:
        print(f"Error during student verification: {str(e)}")

@app.route("/api/student/payment_methods", methods=["POST"])
def add_payment_method():
    try:
        data = request.json
        required_fields = ["student_id", "card_type", "card_number", "card_name", 
                         "card_address", "expiry_date", "cvv"]
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        student = students_collection.find_one({"student_id": data["student_id"]})
        if not student:
            return jsonify({"error": "Student not found"}), 404

        payment_method = {
            "student_id": student["_id"],
            "card_type": data["card_type"],
            "card_number": data["card_number"],
            "card_name": data["card_name"],
            "card_address": data["card_address"],
            "expiry_date": data["expiry_date"],
            "cvv": data["cvv"]
        }
    
        result = payment_methods_collection.insert_one(payment_method)
        
        if result.inserted_id:
            return jsonify({
                "message": "Payment method added successfully",
                "payment_method_id": str(result.inserted_id)
            }), 201
        else:
            return jsonify({"error": "Failed to add payment method"}), 500

    except Exception as e:
        print(f"Error adding payment method: {str(e)}")

        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-rankings-report', methods=['POST'])
def generate_rankings_report():
    try:
        data = request.json
        if not data or 'students' not in data:
            return jsonify({'error': 'No student data provided'}), 400
            
        students = data['students']
        filters = data.get('filters', {})
        
        buffer = BytesIO()
        
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        styles = getSampleStyleSheet()
        
        elements = []
        
        title = Paragraph("Student Rankings Report", styles['Heading1'])
        elements.append(title)
        elements.append(Spacer(1, 20))
        
        filter_info = [
            "Filters Applied:",
            f"Min GPA: {filters.get('minGPA', 'None')}",
            f"Max GPA: {filters.get('maxGPA', 'None')}",
            f"Course: {filters.get('course', 'All')}",
            f"Major: {filters.get('major', 'All')}",
            f"Year: {filters.get('year', 'All')}"
        ]
        for line in filter_info:
            elements.append(Paragraph(line, styles['Normal']))
        
        elements.append(Spacer(1, 20))
        
        table_data = [['Rank', 'Student ID', 'Name', 'Major', 'GPA']]
        for student in students:
            table_data.append([
                str(student.get('rank', '')),
                student.get('studentId', ''),
                student.get('name', ''),
                student.get('major', 'Undeclared'),
                f"{float(student.get('gpa', 0)):.2f}"
            ])
        
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        
        doc.build(elements)
        
        pdf = buffer.getvalue()
        buffer.close()
        
        return send_file(
            BytesIO(pdf),
            mimetype='application/pdf',
            as_attachment=True,
            download_name='student_rankings.pdf'
        )
    
    except Exception as e:
        print(f"Error generating rankings report: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route("/api/drop-course", methods=["POST"])
def drop_course():
    try:
        data = request.json
        student_id = data.get("student_id")
        course = data.get("course")
        
        if not student_id or not course:
            return jsonify({"error": "Student ID and course are required"}), 400
            
        student = students_collection.find_one({"student_id": str(student_id)})
        if not student:
            return jsonify({"error": "Student not found"}), 404
            
        registered_courses = student.get("registered_courses", [])
        registered_grades = student.get("registered_courses_grades", [])
        
        course_index = -1
        for i, registered_course in enumerate(registered_courses):
            if registered_course == course:
                course_index = i
                break
                
        if course_index == -1:
            return jsonify({"error": "Course not found in registered courses"}), 404
            
        registered_courses.pop(course_index)
        if len(registered_grades) > course_index:
            registered_grades.pop(course_index)
            
        result = students_collection.update_one(
            {"student_id": str(student_id)},
            {
                "$set": {
                    "registered_courses": registered_courses,
                    "registered_courses_grades": registered_grades
                }
            }
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Failed to update student record"}), 500
            
        return jsonify({"message": "Course dropped successfully"}), 200
        
    except Exception as e:
        print(f"Error dropping course: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
  app.run(debug=True, host="0.0.0.0", port=5000)
