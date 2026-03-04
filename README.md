# 🚀 Job Portal - Microservices Application

A full-stack job portal platform built with Spring Boot microservices, React frontend, and Apache Kafka for real-time notifications.

## ✨ Features

👤 User Authentication & Authorization
📝 Job Posting & Application Management
📄 Resume Upload & Management
👤 Profile Management
🔔 Real-Time Notifications
🛡️ Admin Dashboard
🏢 Company Profiles

Detailed company information page.
## 🛠️ Tech Stack

**Backend:** Spring Boot 3.1.10, Java 21, Spring Security, MySQL 8.0, Apache Kafka  
**Frontend:** React 18.2.0, Axios, React Router  
**Build Tools:** Maven 3.9, npm

## 🏗️ Architecture

8 microservices: User, Job, Application, Profile, Resume, Notification, Admin, Company  
Optional: Eureka Server, API Gateway

## 📋 Prerequisites

- Java 21 or higher
- Node.js 18 or higher
- MySQL 8.0
- Apache Kafka 3.7.0
- Maven 3.9+

## 🚀 Quick Start

### 1. Setup MySQL

```bash
# Create databases
mysql -u root -p
CREATE DATABASE jobuser;
CREATE DATABASE userdb1;
CREATE DATABASE userdb;
CREATE DATABASE profile_service_db;
CREATE DATABASE resume_service_db;
CREATE DATABASE notificationdb2;
```

2. Setup Kafka

```bash
# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka (in new terminal)
bin/kafka-server-start.sh config/server.properties
```

### 3. Start Backend Services

```bash
# User Service
cd user-microservice
mvn spring-boot:run

# Job Service (new terminal)
cd job-microservice
mvn spring-boot:run

# Application Service (new terminal)
cd application-service
mvn spring-boot:run

# Profile Service (new terminal)
cd profile_management
mvn spring-boot:run

# Resume Service (new terminal)
cd resume
mvn spring-boot:run

# Notification Service (new terminal)
cd simple-notification-service
mvn spring-boot:run

# Admin Service (new terminal)
cd admin-dashboard-microservice
mvn spring-boot:run

```

### 4. Start Frontend

```bash
cd job-portal-frontend
npm install
npm start
```

### 5. Access Application

Frontend: http://localhost:3000

##  Project Structure

```
├── user-microservice/           # Authentication & user management (Port 5454)
├── job-microservice/            # Job postings (Port 8082)
├── application-service/         # Job applications (Port 8087)
├── profile_management/          # User profiles (Port 8088)
├── resume/                      # Resume management (Port 8090)
├── simple-notification-service/ # Notifications (Port 8086)
├── admin-dashboard-microservice/# Admin operations (Port 8085)
├── eureka-server/              # Service discovery (Port 8761) - Optional
├── api-gateway/                # API gateway (Port 8080) - Optional
└── job-portal-frontend/        # React UI (Port 3000)
```

## 🔌 API Endpoints

| Service | Port | Key Endpoints |
|---------|------|---------------|
| User | 5454 | `/api/users/register`, `/api/users/login` |
| Job | 8082 | `/api/jobs`, `/api/jobs/{id}` |
| Company | 8083 | `/api/companies`, `/api/companies/{id}` |
| Application | 8087 | `/api/applications` |
| Profile | 8088 | `/api/profiles/{userId}` |
| Resume | 8090 | `/api/resumes/upload` |
| Notification | 8086 | `/api/notifications` |
| Admin | 8085 | `/api/admin/users`, `/api/admin/stats` |

### Database Configuration

Update `application.properties` in each service
