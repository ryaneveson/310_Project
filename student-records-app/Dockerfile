FROM python:3.12-slim

# Set the correct working directory
WORKDIR /student-records-app

# Install Node.js and npm for React
RUN apt-get update && apt-get install -y nodejs npm

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and env
COPY src ./src
COPY package.json ./
COPY public ./public
COPY .env .env

# Set Flask environment variables
ENV FLASK_APP=src.app
ENV FLASK_ENV=development

# Expose Flask and React ports
EXPOSE 5000
EXPOSE 3000

# Run both frontend and backend
CMD bash -c "npm install && npm start & python src/app.py"