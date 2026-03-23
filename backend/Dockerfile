# Stage 1: Build the application with Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy the pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application with OpenJDK
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR from the build stage
# The JAR name is based on the artifactId and version in pom.xml
COPY --from=build /app/target/maturity-survey-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
# We use the shell form to correctly expand the PORT environment variable
CMD java -Dserver.port=${PORT:-8080} -jar app.jar
