from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt

app = Flask(__name__)
CORS(app)

# Database connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="304rootpw",
    database="student_records"
)
cursor = db.cursor()

# Register (Sign Up) endpoint
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password").encode("utf-8")

    # Hash the password
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password.decode("utf-8")))
        db.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500

# Login endpoint (for reference)
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password").encode("utf-8")

    cursor.execute("SELECT password FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()

    if user and bcrypt.checkpw(password, user[0].encode("utf-8")):
        return jsonify({"message": "Login successful!"}), 200
    return jsonify({"error": "Invalid credentials"}), 401
@app.route("/courses", methods=["GET"])
def get_courses():
    cursor.execute("SELECT id, name FROM courses")  # Fetch courses from DB
    courses = [{"id": row[0], "name": row[1]} for row in cursor.fetchall()]
    return jsonify(courses)
    

if __name__ == "__main__":
    app.run(debug=True, port=5000)
