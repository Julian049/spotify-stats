# One image for everything: Spring Boot serves the built web app and the /api endpoints from the same
# origin, so the browser needs no CORS and the web needs no API URL.

# 1. Build the web app (static files in /web/dist).
FROM node:22.12.0-alpine3.21 AS web
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# 2. Build the server jar with the web app inside (Spring serves classpath:/static at /).
FROM maven:3.9.9-eclipse-temurin-21-alpine AS server
WORKDIR /server
COPY server/pom.xml ./
RUN mvn -q dependency:go-offline
COPY server/src ./src
COPY --from=web /web/dist ./src/main/resources/static
# Tests run in development (./mvnw test); here they would only slow the image build.
RUN mvn -q package -DskipTests

# 3. Run on a small JRE-only Alpine image, as a non-root user.
FROM eclipse-temurin:21.0.5_11-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=server /server/target/server-*.jar app.jar
USER app
# Render (and most hosts) pass the port in $PORT; application.properties reads it.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
