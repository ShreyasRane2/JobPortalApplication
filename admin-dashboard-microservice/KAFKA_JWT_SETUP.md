# Admin Dashboard Microservice - Kafka & JWT Setup Guide

## Overview
The Admin Dashboard Microservice now includes:
- **Kafka Integration** for event-driven architecture
- **JWT Authentication** for securing API endpoints
- **Audit Logging** for tracking admin actions

## Architecture

### Components Added

1. **Kafka Support**
   - Topic: `admin-events-topic` for admin actions
   - Producer: `AdminEventProducer` - publishes admin events
   - Consumer: `AdminEventConsumer` - processes admin events

2. **JWT Authentication**
   - `JwtProvider` - generates and validates JWT tokens
   - `JwtAuthenticationFilter` - intercepts requests and validates tokens
   - `SecurityConfig` - configures Spring Security with JWT
   - `AuthController` - REST endpoints for authentication

3. **Event DTOs**
   - `AdminEvent` - event payload for Kafka
   - `AuthRequest` - login request
   - `AuthResponse` - token response

## Prerequisites

### Local Development
- Java 17+
- Maven 3.8+
- Docker & Docker Compose
- MySQL 8.0
- Kafka (via Docker Compose)

### Ports Used
- **Admin Dashboard**: 8085
- **Kafka**: 9092 (PLAINTEXT_HOST), 29092 (Docker internal)
- **Zookeeper**: 2181
- **Kafka UI**: 8080
- **MySQL**: 3306
- **Eureka**: 8761

## Configuration

### Local Environment (application.properties)

```properties
# Kafka
kafka.bootstrapAddress=localhost:9092
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=admin-dashboard-group

# JWT
jwt.secret=mySecretKeyForAdminDashboardServiceJwtAuthenticationToken123456789
jwt.expiration=86400000  # 24 hours in milliseconds
```

### Docker Environment (application-docker.properties)

```properties
# Kafka
kafka.bootstrapAddress=kafka:29092
spring.kafka.bootstrap-servers=kafka:29092

# JWT
jwt.secret=mySecretKeyForAdminDashboardServiceJwtAuthenticationToken123456789
jwt.expiration=86400000
```

## Running the Service

### Using Docker Compose (Recommended)

```bash
# 1. Navigate to project root
cd "C:\Job Portal Application\job-portal"

# 2. Build the admin-dashboard-ms image
cd admin-dashboard-ms
mvn clean package -DskipTests
docker build -t admin-dashboard-ms:latest .

# 3. Start all services
cd ..
docker-compose up -d

# 4. Verify services are running
docker-compose ps

# 5. Access Kafka UI
# Open browser: http://localhost:8080
```

### Local Development

```bash
# 1. Start Docker services (kafka, zookeeper, mysql)
cd "C:\Job Portal Application\job-portal"
docker-compose up -d zookeeper kafka mysql kafka-ui

# 2. Build and run admin-dashboard-ms
cd admin-dashboard-ms
mvn clean install

# 3. Run the application with local profile
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"

# Or run the JAR
java -jar target/admin-dashboard-microservice-0.0.1-SNAPSHOT.jar --spring.profiles.active=local
```

## API Endpoints

### Authentication Endpoints

#### 1. Login (Generate JWT Token)
```bash
POST /api/auth/login
Content-Type: application/json

{
  "userId": "admin123",
  "email": "admin@hirehub.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "message": "Login successful",
  "email": "admin@hirehub.com",
  "userId": "admin123"
}
```

#### 2. Validate Token
```bash
POST /api/auth/validate
Authorization: Bearer <your-jwt-token>

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "message": "Token is valid",
  "email": "admin@hirehub.com",
  "userId": "admin123"
}
```

#### 3. Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <your-jwt-token>

Response (200 OK):
{
  "userId": "admin123",
  "email": "admin@hirehub.com",
  "message": "User details retrieved"
}
```

### Example cURL Commands

```bash
# Step 1: Login and get token
curl -X POST http://localhost:8085/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin123",
    "email": "admin@hirehub.com",
    "password": "password123"
  }'

# Step 2: Copy the token from response

# Step 3: Use token in subsequent requests
curl -X GET http://localhost:8085/api/admin/dashboard/stats \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Kafka Topics

### admin-events-topic

**Purpose**: Centralized event logging for all admin actions

**Event Types**:
- `AUDIT_LOG` - Admin action logging
- `JOB_UPDATE` - Job modifications
- `USER_ACTIVITY` - User activity tracking
- `APPLICATION_STATUS` - Application status changes

**Sample Event**:
```json
{
  "eventId": "evt-001",
  "eventType": "AUDIT_LOG",
  "description": "Admin updated job posting",
  "userId": "admin123",
  "timestamp": "1707721234567",
  "action": "UPDATE",
  "targetResource": "job-123",
  "status": "LOGGED"
}
```

### Publishing Events

```java
@Autowired
private AdminEventProducer adminEventProducer;

// Publish audit log
adminEventProducer.publishAuditLog(
    "admin123", 
    "DELETE", 
    "job-456"
);

// Publish custom event
AdminEvent event = new AdminEvent();
event.setEventId("evt-002");
event.setEventType("JOB_UPDATE");
event.setUserId("admin123");
event.setAction("CREATE");
event.setTargetResource("job-789");
event.setStatus("COMPLETED");
adminEventProducer.publishAdminEvent(event);
```

## Security Features

### JWT Token Structure

The JWT token includes:
- **Subject (sub)**: User ID
- **Claims**:
  - `email`: User's email address
  - `iat`: Issued at timestamp
  - `exp`: Expiration timestamp
- **Signature**: HMAC SHA-512

### Token Validation

All endpoints except `/api/auth/**` and `/actuator/**` require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Protected Endpoints

```
GET  /api/admin/**          -> Requires JWT token
GET  /api/admin/dashboard/* -> Requires JWT token
PUT  /api/admin/jobs/*      -> Requires JWT token
DELETE /api/admin/jobs/*    -> Requires JWT token
```

### Public Endpoints

```
POST /api/auth/login        -> No token required
POST /api/auth/validate     -> Uses provided token
GET  /actuator/health       -> No token required
GET  /actuator/metrics      -> No token required
```

## Monitoring & Troubleshooting

### Check Kafka Topics

```bash
# List all topics
docker exec kafka kafka-topics --list --bootstrap-server kafka:9092

# Create topic (if auto-creation disabled)
docker exec kafka kafka-topics --create \
  --bootstrap-server kafka:9092 \
  --topic admin-events-topic \
  --partitions 3 \
  --replication-factor 1

# Monitor topic messages
docker exec kafka kafka-console-consumer \
  --bootstrap-server kafka:9092 \
  --topic admin-events-topic \
  --from-beginning
```

### Check Logs

```bash
# Service logs
docker logs admin-dashboard-ms -f

# Kafka logs
docker logs kafka -f

# View all logs
docker-compose logs -f
```

### Service Health Check

```bash
# Health endpoint
curl http://localhost:8085/actuator/health

# Metrics
curl http://localhost:8085/actuator/metrics
```

### Database Queries

```bash
# Connect to MySQL
docker exec -it job-portal-mysql mysql -u root -p

# List databases
SHOW DATABASES;

# Use admin database
USE admindb;

# Show tables
SHOW TABLES;
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Kafka connection refused | Ensure Kafka container is running: `docker-compose ps kafka` |
| JWT token invalid | Verify secret key matches in application.properties |
| Eureka registration fails | Check service-registry is running on port 8761 |
| Database connection error | Verify MySQL container is running and credentials match |
| Port already in use | Change port in application.properties or kill process using port |
| PLAINTEXT_HOST error in Docker | Ensure docker-compose uses `kafka:29092` for internal communication |

## Next Steps

1. **Implement Audit Trail**: Store all admin events in database
2. **Add Role-Based Access Control (RBAC)**: Different permissions for admin roles
3. **Email Notifications**: Send alerts for critical admin actions
4. **Dashboard Visualization**: Create UI to display admin events and metrics
5. **Event Retention Policy**: Archive old events to separate storage
6. **Advanced JWT Features**: Token refresh, multi-device support
7. **Rate Limiting**: Prevent API abuse
8. **API Documentation**: Swagger/Springdoc integration

## Testing

### Unit Tests

```bash
mvn test
```

### Integration Tests

```bash
# Start all services
docker-compose up -d

# Run integration tests
mvn verify
```

### Manual Testing with Postman

1. Import the included Postman collection
2. Set environment variables:
   - `base_url`: http://localhost:8085
3. Test endpoints in order:
   - POST /api/auth/login
   - POST /api/auth/validate
   - GET /api/auth/me
   - GET /api/admin/** (with token)

## Docker Build

```bash
# Build Docker image
docker build -t admin-dashboard-ms:latest .

# Run container
docker run -d \
  --name admin-dashboard-ms \
  -p 8085:8085 \
  -e SPRING_PROFILES_ACTIVE=docker \
  --network job-portal-network \
  admin-dashboard-ms:latest

# Check logs
docker logs -f admin-dashboard-ms
```

## References

- [Spring Kafka Documentation](https://spring.io/projects/spring-kafka)
- [JWT with Spring Security](https://www.jwtdecoder.io/)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Spring Security Reference](https://spring.io/projects/spring-security)

## Support

For issues or questions, contact the development team or refer to the project documentation.
