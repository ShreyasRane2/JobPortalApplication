# Job Microservice - Kafka & JWT Setup Guide

## Overview
The Job Microservice now includes:
- **Kafka Integration** for event-driven job management
- **JWT Authentication** for securing API endpoints
- **Event Publishing** for job lifecycle events

## Architecture

### Components Added

1. **Kafka Support**
   - Topic: `job-events-topic` for job events
   - Producer: `JobEventProducer` - publishes job events
   - Consumer: `JobEventConsumer` - processes job events

2. **JWT Authentication** (Already configured)
   - `JwtProvider` - generates and validates JWT tokens
   - `JwtAuthenticationFilter` - intercepts requests
   - `SecurityConfig` - Spring Security configuration

3. **Event DTOs**
   - `JobEvent` - event payload for Kafka
   
## Kafka Topics

### job-events-topic

**Purpose**: Central messaging topic for all job-related events

**Event Types**:
- `JOB_CREATED` - New job posting created
- `JOB_UPDATED` - Job details updated
- `JOB_DELETED` - Job posting deleted
- `JOB_PUBLISHED` - Job published to portal
- `JOB_CLOSED` - Job posting closed

**Sample Event**:
```json
{
  "eventId": "job-evt-001",
  "eventType": "JOB_CREATED",
  "description": "New software engineer position",
  "jobId": 123,
  "companyId": 456,
  "timestamp": "1707721234567",
  "action": "CREATE",
  "jobTitle": "Senior Software Engineer",
  "status": "ACTIVE"
}
```

## Configuration

### Local Environment (application.properties)

```properties
# Kafka
kafka.bootstrapAddress=localhost:9092
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=job-service-group

# JWT
jwt.secret=mySecretKeyForJobServiceJwtAuthenticationToken123456789
jwt.expiration=86400000
```

### Docker Environment (application-docker.properties)

```properties
# Kafka (Docker)
kafka.bootstrapAddress=kafka:29092
spring.kafka.bootstrap-servers=kafka:29092

# JWT
jwt.secret=mySecretKeyForJobServiceJwtAuthenticationToken123456789
jwt.expiration=86400000
```

## Running the Service

### Using Docker Compose

```bash
# 1. Navigate to project root
cd "C:\Job Portal Application\job-portal"

# 2. Start all services
docker-compose up -d

# 3. Verify services are running
docker-compose ps

# 4. Access Kafka UI
# Open browser: http://localhost:8080
```

### Local Development

```bash
# 1. Start Docker services (kafka, zookeeper, mysql)
docker-compose up -d zookeeper kafka mysql kafka-ui

# 2. Build job-ms
cd job-ms/job-ms
mvn clean install

# 3. Run the application
mvn spring-boot:run
```

## API Endpoints

### Job Endpoints (Protected - Requires JWT)

```bash
# Get all jobs
GET /api/jobs
Authorization: Bearer <jwt-token>

# Get job by ID
GET /api/jobs/{id}
Authorization: Bearer <jwt-token>

# Create new job
POST /api/jobs
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "title": "Senior Developer",
  "description": "Looking for experienced developers",
  "minSalary": "100000",
  "maxSalary": "150000",
  "location": "San Francisco",
  "experience": 5,
  "companyId": 123,
  "keySkills": ["Java", "Spring Boot", "Docker"],
  "workMode": "HYBRID",
  "jobType": "FULL_TIME"
}

# Update job
PUT /api/jobs/{id}
Authorization: Bearer <jwt-token>

# Delete job
DELETE /api/jobs/{id}
Authorization: Bearer <jwt-token>

# Search jobs
GET /api/jobs/search?keyword=engineer
Authorization: Bearer <jwt-token>
```

### Kafka Events Triggered

When you perform job operations, these events are automatically published to Kafka:

```bash
POST /api/jobs (Create)
  → Publishes: JOB_CREATED event

PUT /api/jobs/{id} (Update)
  → Publishes: JOB_UPDATED event

DELETE /api/jobs/{id} (Delete)
  → Publishes: JOB_DELETED event
```

## Publishing Events from Code

```java
@Autowired
private JobEventProducer jobEventProducer;

// Publish job created event
jobEventProducer.publishJobCreated(jobId, companyId, jobTitle);

// Publish job updated event
jobEventProducer.publishJobUpdated(jobId, companyId, jobTitle);

// Publish job deleted event
jobEventProducer.publishJobDeleted(jobId, companyId, jobTitle);

// Publish custom job event
JobEvent event = new JobEvent();
event.setEventType("JOB_PUBLISHED");
event.setJobId(jobId);
event.setStatus("PUBLISHED");
jobEventProducer.publishJobEvent(event);
```

## Monitoring & Troubleshooting

### Check Kafka Topics

```bash
# List topics
docker exec kafka kafka-topics --list --bootstrap-server kafka:9092

# Create topic (if auto-creation is disabled)
docker exec kafka kafka-topics --create \
  --bootstrap-server kafka:9092 \
  --topic job-events-topic \
  --partitions 3 \
  --replication-factor 1

# Monitor topic messages
docker exec kafka kafka-console-consumer \
  --bootstrap-server kafka:9092 \
  --topic job-events-topic \
  --from-beginning
```

### Check Service Logs

```bash
# Service logs
docker logs job-ms -f

# Kafka logs
docker logs kafka -f

# View all logs
docker-compose logs -f
```

### Service Health

```bash
# Health endpoint
curl http://localhost:8082/actuator/health

# Metrics (requires authentication)
curl -H "Authorization: Bearer <token>" http://localhost:8082/actuator/metrics
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Kafka connection refused | Ensure Kafka is running: `docker-compose ps kafka` |
| JWT token invalid | Verify Authorization header format: `Bearer <token>` |
| Topic not found | Check if topic exists or enable auto-creation in Kafka |
| Database connection error | Verify MySQL is running with correct credentials |
| Port 8082 already in use | Change port in application.properties |
| Kafka consumer lag | Check consumer group: `docker exec kafka kafka-consumer-groups --list --bootstrap-server kafka:9092` |

## Dependencies Added

```xml
<!-- Kafka -->
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>

<!-- Spring Security (for JWT) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT Library -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
```

## Next Steps

1. **Integrate with Admin Dashboard** - Send job events to Admin Dashboard
2. **Notification Service Integration** - Notify users on job updates
3. **Analytics** - Track job event metrics
4. **Audit Logging** - Store all job events in database
5. **Event Replay** - Ability to replay past events
6. **Dead Letter Queue** - Handle failed event processing

## Docker Build

```bash
# Build Docker image
docker build -t job-ms:latest .

# Run container
docker run -d \
  --name job-ms \
  -p 8082:8082 \
  -e SPRING_PROFILES_ACTIVE=docker \
  --network job-portal-network \
  job-ms:latest

# Check logs
docker logs -f job-ms
```

## Files Modified/Created

### Created:
- `config/KafkaConfig.java` - Kafka producer/consumer configuration
- `kafka/JobEventProducer.java` - Event publisher
- `kafka/JobEventConsumer.java` - Event consumer
- `dto/JobEvent.java` - Event payload

### Modified:
- `pom.xml` - Added Kafka dependency
- `application.properties` - Added Kafka configuration
- `application-docker.properties` - Added Docker Kafka configuration

## Testing

### Manual Testing with Postman

1. **Generate JWT Token** (from another service)
2. **Create a Job**:
   ```
   POST http://localhost:8082/api/jobs
   Authorization: Bearer <token>
   ```
   - Check Kafka UI at http://localhost:8080
   - Verify JOB_CREATED event appears in job-events-topic

3. **Update a Job**:
   ```
   PUT http://localhost:8082/api/jobs/1
   - Check Kafka for JOB_UPDATED event
   ```

4. **Delete a Job**:
   ```
   DELETE http://localhost:8082/api/jobs/1
   - Check Kafka for JOB_DELETED event
   ```

## References

- [Spring Kafka Documentation](https://spring.io/projects/spring-kafka)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [JWT with Spring Security](https://www.jwtdecoder.io/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

## Support

For issues or questions, contact the development team or refer to the project documentation.
