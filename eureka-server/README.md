# Eureka Server - Service Discovery

This is the Eureka Server for the Job Portal microservices architecture. It provides service discovery and registration for all microservices.

## Port
- **8761** - Eureka Server Dashboard

## Features
- Service Registration
- Service Discovery
- Health Monitoring
- Load Balancing Support
- Dashboard UI

## Starting the Server

### Option 1: Using Batch File
```bash
START_EUREKA.bat
```

### Option 2: Using Maven
```bash
mvnw spring-boot:run
```

### Option 3: Using Java
```bash
mvnw clean package
java -jar target/eureka-server-1.0.0.jar
```

## Accessing the Dashboard

Once started, open your browser and navigate to:
```
http://localhost:8761
```

You'll see all registered microservices and their status.

## Registered Services

The following services will register with Eureka:

1. **USER-SERVICE** (Port 5454)
2. **JOB-SERVICE** (Port 8081)
3. **APPLICATION-SERVICE** (Port 8082)
4. **COMPANY-SERVICE** (Port 8083)
5. **PROFILE-SERVICE** (Port 8088)
6. **RESUME-SERVICE** (Port 8089)
7. **NOTIFICATION-SERVICE** (Port 8086)
8. **ADMIN-DASHBOARD-SERVICE** (Port 8087)

## Configuration

The Eureka Server is configured with:
- Self-preservation enabled
- Eviction interval: 60 seconds
- No self-registration (server doesn't register itself)

## Health Check

Check server health at:
```
http://localhost:8761/actuator/health
```

## Troubleshooting

### Port Already in Use
If port 8761 is already in use, you can change it in `application.properties`:
```properties
server.port=8761
```

### Services Not Registering
1. Ensure Eureka Server is running first
2. Check that client services have correct Eureka URL
3. Verify network connectivity
4. Check client service logs for connection errors

## Dependencies

- Spring Boot 3.2.0
- Spring Cloud 2023.0.0
- Netflix Eureka Server
