FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY target/admin-dashboard-microservice-0.0.1-SNAPSHOT.jar /app/admin-dashboard-microservice-0.0.1-SNAPSHOT.jar
EXPOSE 8085
CMD ["java", "-jar", "admin-dashboard-microservice-0.0.1-SNAPSHOT.jar"]