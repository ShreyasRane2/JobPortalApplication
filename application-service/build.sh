#!/bin/bash

# Build script with Java 17 compatibility for Spring Boot 4.0.2

echo ""
echo "================================"
echo "Building Application Service with Kafka & JWT"
echo "================================"
echo ""

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed or not in PATH"
    exit 1
fi

# Get current Java version
JAVA_VERSION=$(java -version 2>&1 | grep 'version' | awk -F '"' '{print $2}')
echo "Current Java Version: $JAVA_VERSION"

# Clean and build
echo ""
echo "Cleaning previous builds..."
rm -rf target

echo ""
echo "Downloading dependencies and compiling..."
./mvnw clean compile

if [ $? -ne 0 ]; then
    echo ""
    echo "============================================"
    echo "Build Compilation Failed"
    echo "============================================"
    echo ""
    echo "SOLUTION: Use Docker to build with Java 17:"
    echo ""
    echo "  docker run --rm -v \"\$(pwd)\":/workspace -w /workspace \\"
    echo "    maven:3.9-eclipse-temurin-17 \\"
    echo "    mvn clean package -DskipTests"
    echo ""
    echo "OR update Spring Boot version in pom.xml to 4.0.9+"
    echo ""
    exit 1
fi

echo ""
echo "Packaging application..."
./mvnw package -DskipTests

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "BUILD SUCCESSFUL!"
    echo "============================================"
    echo ""
    echo "JAR Location: target/application-service-0.0.1-SNAPSHOT.jar"
    echo ""
    echo "Next steps:"
    echo "  1. Start services: docker-compose up -d"
    echo "  2. Run the app: java -jar target/application-service-0.0.1-SNAPSHOT.jar"
    echo ""
else
    echo ""
    echo "============================================"
    echo "BUILD FAILED"
    echo "============================================"
    echo ""
    echo "See error messages above for details."
    echo ""
fi

exit $?
