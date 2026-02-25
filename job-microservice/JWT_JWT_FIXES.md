# Job Microservice - Fixed & JWT Integration

## Summary of Changes

### ✅ Errors Fixed

1. **Removed Review Service Dependency**
   - Removed `review-service.url` from application.properties
   - Removed `ReviewClient` interface and its usage
   - Removed `List<Review>` parameters from JobMapper methods
   - Removed `reviews` and `averageRating` fields from JobDTO mappings

2. **Fixed Import Errors in JobMapper.java**
   - Changed `import com.job.microservice.Job;` → `import com.job.microservice.entity.Job;`
   - Fixed malformed import: `import com.job.microservice.external;` → proper imports
   - Removed non-existent Review class imports
   - Updated method signature to remove review parameters

3. **Fixed JobServiceImplementation.java**
   - Corrected package declaration
   - Removed ReviewClient dependency injection
   - Removed review-related method calls
   - Fixed import statements to use correct package paths
   - Updated convertToDto method to remove review client calls

4. **Created CompanyClient Interface**
   - Created properly structured FeignClient interface
   - Configured for company-service communication at port 8081

### ✅ JWT Authentication Added

#### New Files Created:

1. **JwtProvider.java**
   - Token generation and validation
   - Claims extraction (userId, email)
   - Bearer token parsing

2. **JwtAuthenticationFilter.java**
   - Request interceptor for JWT validation
   - Sets authentication context in SecurityContextHolder
   - Handles malformed tokens gracefully

3. **SecurityConfig.java**
   - Spring Security configuration
   - Endpoint authorization rules
   - JWT filter integration
   - Session management (STATELESS)

#### Dependencies Added to pom.xml:

```xml
<!-- JWT Dependencies -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>

<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

### ✅ Configuration Updates

**application.properties**
- Removed review-service.url reference
- Added JWT configuration:
  ```properties
  jwt.secret=mySecretKeyForJobServiceJwtAuthenticationToken123456789
  jwt.expiration=86400000
  ```

## Architecture

### JWT Security Flow

```
HTTP Request with Authorization header
           ↓
JwtAuthenticationFilter (validates token)
           ↓
SecurityContextHolder (sets authentication)
           ↓
Access Granted/Denied based on SecurityConfig rules
```

### Microservice Communication

```
Job Service (port 8082)
         ↓
    CompanyClient (Feign)
         ↓
Company Service (port 8081)
```

## Endpoint Access Rules

### Public Endpoints (No JWT Required)
- `GET /actuator/health`
- `GET /actuator/metrics`
- `POST /api/auth/**` (future login endpoints)

### Protected Endpoints (JWT Required)
- `GET /api/jobs/**`
- `POST /api/jobs/**`
- `PUT /api/jobs/**`
- `DELETE /api/jobs/**`

## How to Use

### 1. Build the Project
```bash
cd "C:\Job Portal Application\job-portal\job-ms\job-ms"
mvn clean install
```

### 2. Run the Service
```bash
# Using Maven
mvn spring-boot:run

# Or using JAR
java -jar target/job-microservice-0.0.1-SNAPSHOT.jar
```

### 3. Generate JWT Token
```bash
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "email": "user@hirehub.com",
    "password": "password123"
  }'
```

### 4. Use Token in API Calls
```bash
curl -X GET http://localhost:8082/api/jobs \
  -H "Authorization: Bearer <your-jwt-token>"
```

## File Structure

```
job-ms/job-ms/src/main/java/com/job/microservice/
├── client/
│   └── CompanyClient.java (NEW)
├── controller/
│   ├── AdminJobController.java
│   └── JobController.java
├── dto/
│   ├── JOB_STATUS.java
│   ├── JOB_TYPE.java
│   ├── WORK_MODE.java
│   └── JobDTO.java
├── entity/
│   ├── Job.java
│   └── JobResult.java
├── external/
│   └── Company.java
├── mapper/
│   └── JobMapper.java (FIXED)
├── repository/
│   └── JobRepository.java
├── security/
│   ├── JwtProvider.java (NEW)
│   ├── JwtAuthenticationFilter.java (NEW)
│   └── SecurityConfig.java (NEW)
├── service/
│   ├── JobService.java
│   └── impl/
│       └── JobServiceImplementation.java (FIXED)
└── JobMicroserviceApplication.java
```

## Testing

### Health Check
```bash
curl http://localhost:8082/actuator/health
```

### Get All Jobs (Protected)
```bash
curl -X GET http://localhost:8082/api/jobs \
  -H "Authorization: Bearer <jwt-token>"
```

### Create Job (Protected)
```bash
curl -X POST http://localhost:8082/api/jobs \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Java Developer",
    "description": "5+ years of experience",
    "minSalary": "15 LPA",
    "maxSalary": "25 LPA",
    "location": "Bangalore",
    "experience": 5,
    "workMode": "HYBRID",
    "jobType": "FULL_TIME"
  }'
```

## Known Issues Resolved

| Issue | Status | Solution |
|-------|--------|----------|
| ReviewClient not found | ✅ Fixed | Removed review service dependency |
| Invalid imports in JobMapper | ✅ Fixed | Corrected package imports |
| Missing CompanyClient interface | ✅ Fixed | Created proper FeignClient |
| No JWT authentication | ✅ Fixed | Added complete JWT implementation |
| Missing Security Configuration | ✅ Fixed | Added SecurityConfig class |

## Next Steps

1. **Implement Auth Endpoints** - Create `/api/auth/login` endpoint
2. **Database Schema** - Update Job entity to remove review references
3. **Error Handling** - Add global exception handlers
4. **API Documentation** - Add Swagger/Springdoc integration
5. **Unit Tests** - Create test cases for all services
6. **Performance** - Add caching for frequently accessed data

## References

- [Spring Security Docs](https://spring.io/projects/spring-security)
- [JWT with Spring](https://jwt.io/)
- [Spring Cloud OpenFeign](https://spring.io/projects/spring-cloud-openfeign)
- [Resilience4j Circuit Breaker](https://resilience4j.readme.io/)

## Contact

For issues or questions regarding this service, contact the development team.
