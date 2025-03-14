# Use the official Python image for Flask
FROM python:3.12-slim

# Set working directory for both Flask and React
WORKDIR /app

# Install Node.js and npm (required for React)
RUN apt-get update && apt-get install -y nodejs npm

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire src directory
COPY src /app/src
COPY .env /app/.env


# Set environment variables for Flask
ENV FLASK_APP=src/app.py
ENV FLASK_ENV=development

# Expose both Flask and React app ports
EXPOSE 5000
EXPOSE 3000

# Command to run Flask backend and React frontend together
CMD bash -c "npm install && npm start & python app.py"
