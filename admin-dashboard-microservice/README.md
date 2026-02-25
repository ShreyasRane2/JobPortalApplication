# Admin Dashboard Microservice

This microservice provides administrative functionalities for the Job Portal system, allowing administrators to manage users, job postings, monitor platform activity, and generate reports.

## Features

### User Management
- View all users
- View individual user details
- Update user information
- Delete users

### Job Management
- View all job postings
- View individual job details
- Create new job postings
- Update existing job postings
- Delete job postings

### Job Application Management
- View applications for specific jobs
- View applications by users
- Update application status (e.g., APPROVED, REJECTED, SHORTLISTED)

### Monitoring and Reports
- Dashboard statistics (total users, jobs, active jobs)
- Job reports (status counts)
- Application reports
- User activity reports

## API Endpoints

### User Management
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/{id}` - Get user by ID
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user

### Job Management
- `GET /api/admin/jobs` - Get all jobs
- `GET /api/admin/jobs/{id}` - Get job by ID
- `POST /api/admin/jobs` - Create job (requires companyId parameter)
- `PUT /api/admin/jobs/{id}` - Update job
- `DELETE /api/admin/jobs/{id}` - Delete job

### Job Application Management
- `GET /api/admin/applications/job/{jobId}` - Get applications for a job
- `GET /api/admin/applications/user/{userId}` - Get applications by user
- `PUT /api/admin/applications/{id}/status` - Update application status

### Reports
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/reports/jobs` - Get job report
- `GET /api/admin/reports/applications` - Get application report
- `GET /api/admin/reports/users` - Get user report

## Technology Stack
- Java 17
- Spring Boot 3.1.10
- Spring Cloud (OpenFeign, Eureka Client)
- MySQL
- Maven

## Configuration
- Server Port: 8085
- Database: admindb
- Eureka Server: http://localhost:8761/eureka/

## Dependencies
This service communicates with other microservices via Feign clients:
- User Service
- Job Service
- Job Application Service

## Running the Service
1. Ensure other microservices and Eureka server are running
2. Configure database settings in `application.properties`
3. Run with Maven: `mvn spring-boot:run`
4. Or build and run JAR: `mvn clean package && java -jar target/admin-dashboard-microservice-0.0.1-SNAPSHOT.jar`

## Docker
Build Docker image: `docker build -t admin-dashboard-ms .`
Run container: `docker run -p 8085:8085 admin-dashboard-ms`