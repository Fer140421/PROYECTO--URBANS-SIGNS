# Etapa 1: Build de la aplicación
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x ./mvnw

# Descarga de dependencias para acelerar builds posteriores
RUN ./mvnw dependency:go-offline -B || true

COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Etapa 2: Runtime ultraligero
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Crear usuario seguro sin privilegios de root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup

COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

# Opciones de memoria para evitar saturar el contenedor (funciona en 512MB de RAM)
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-Xmx384m", \
  "-Xms256m", \
  "-XX:+UseSerialGC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
