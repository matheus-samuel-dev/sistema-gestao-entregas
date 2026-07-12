FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q test && mvn -q -DskipTests package

FROM eclipse-temurin:17-jre

WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system logitrack \
    && useradd --system --gid logitrack --home-dir /app logitrack
COPY --from=build --chown=logitrack:logitrack /app/target/logitrack-api-0.0.1-SNAPSHOT.jar app.jar
USER logitrack
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD curl --fail --silent http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
