FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY target/job-microservice-0.0.1-SNAPSHOT.jar /app/job-microservice-0.0.1-SNAPSHOT.jar
EXPOSE 8082
CMD ["java", "-jar", "job-microservice-0.0.1-SNAPSHOT.jar"]