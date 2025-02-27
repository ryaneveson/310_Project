from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# MongoDB Connection
MONGO_URI = "mongodb+srv://samijaffri01:6XjmdnygdfRrD8dF@cluster0.fgfo7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["student_records"]  
users_collection = db["users"]
finance_collection = db["finances"]  # New collection for financial data

# ---------------------- USER AUTHENTICATION ----------------------

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
        "password": hashed_password.decode("utf-8")  # Store hashed password
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

# ---------------------- FINANCIAL INFORMATION ----------------------

@app.route("/add-finance", methods=["POST"])
def add_finance():
    data = request.json

    # Extract and validate input fields
    student_id = data.get("student_id")
    name_on_file = data.get("name_on_file")
    card_number = data.get("card_number", "")
    expiry_date = data.get("expiry_date")
    billing_address = data.get("billing_address", {})
    payment_provider = data.get("payment_provider")

    if not student_id or not name_on_file or not expiry_date or not billing_address or not payment_provider:
        return jsonify({"error": "Missing required fields"}), 400

    if len(card_number) != 16 or not card_number.isdigit():
        return jsonify({"error": "Invalid credit card number"}), 400

    # Store only the last 4 digits of the card
    finance_data = {
        "student_id": student_id,
        "name_on_file": name_on_file,
        "card_last4": card_number[-4:],  # Last 4 digits only
        "expiry_date": expiry_date,
        "billing_address": billing_address,
        "payment_provider": payment_provider,
        "tokenized_card_id": f"tok_{os.urandom(6).hex()}"  # Simulated token for security
    }

    finance_collection.insert_one(finance_data)
    return jsonify({"message": "Financial info saved successfully"}), 201

@app.route("/get-finances/<student_id>", methods=["GET"])
def get_finances(student_id):
    finances = list(finance_collection.find({"student_id": student_id}, {"_id": 0}))  # Exclude MongoDB's default _id
    return jsonify(finances), 200

# ---------------------- LOGGING ----------------------

@app.before_request
def log_request():
    print(f"Incoming {request.method} request to {request.path}")

# ---------------------- RUN FLASK ----------------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)
