# URBAN WORKS — Sistema de Gestión Interna para Urban Signs

![Build Status](https://img.shields.io/badge/status-active-success.svg)
![Architecture](https://img.shields.io/badge/architecture-decoupled-blue.svg)
![Stack](https://img.shields.io/badge/stack-Spring%20Boot%20%7C%20Angular%20%7C%20PostgreSQL-orange.svg)

## 📌 Descripción del Proyecto
**URBAN WORKS** es una solución web integral desarrollada para la empresa **Urban Signs** (Tarija), diseñada para optimizar y centralizar la gestión de cotizaciones, la administración y seguimiento de pedidos en taller y el control del préstamo de herramientas de trabajo.

El sistema elimina el uso de registros manuales y llamadas telefónicas, proporcionando una plataforma responsive adaptada tanto para el personal administrativo de **Oficina** (escritorio 1366 px) como para el personal operativo de **Taller** (navegador móvil 360 px).

---

## 🔗 Estructura de Repositorios

El desarrollo del proyecto está alojado bajo una estructura monorepo que integra tres proyectos independientes con sus propios historiales de control de versiones y commits fechados:

* 📦 **Repositorio Principal (Monorepo General):**  
  [https://github.com/Fer140421/PROYECTO--URBANS-SIGNS](https://github.com/Fer140421/PROYECTO--URBANS-SIGNS)

* ⚙️ **Sub-Repositorio Backend (API REST Spring Boot):**  
  [https://github.com/Fer140421/Backend---URBAN-SIGNS.git](https://github.com/Fer140421/Backend---URBAN-SIGNS.git)

* 📊 **Sub-Repositorio Dashboard (Frontend Angular Administrativo):**  
  [https://github.com/Fer140421/Frontend---URBAN-SIGNS-DASHBOARD.git](https://github.com/Fer140421/Frontend---URBAN-SIGNS-DASHBOARD.git)

* 🌐 **Sub-Repositorio Website (Portal Cliente / Consulta por Código):**  
  [https://github.com/Fer140421/Website---URBAN-SIGNS.git](https://github.com/Fer140421/Website---URBAN-SIGNS.git)

* 🌐 **Sub-Repositorio APP movil (Personal del taller):**  
  [https://github.com/Fer140421/App---URBAN-SIGNS](https://github.com/Fer140421/App---URBAN-SIGNS)
---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Versión | Rol en el Sistema |
| :--- | :--- | :---: | :--- |
| **Backend API** | Java / Spring Boot | `21` / `3.4.5` | Servicio REST, autenticación JWT en cookies y lógica de negocio. |
| **Base de Datos** | PostgreSQL | `16.1` | Almacenamiento relacional de datos. |
| **Frontend Dashboard**| Angular | `18.2` | Panel administrativo para roles de Oficina y Taller. |
| **Website Portal** | Angular | `18.2` | Portal público de consulta por código de seguimiento. |
| **Estilos UI** | TailwindCSS | `3.4` | Diseño responsive adaptado a 360 px y 1366 px. |
| **Servicios Cloud** | Cloudinary / SMTP | API v1.1 | Subida de fotos de evidencia y notificaciones por correo. |

---

## ⚡ Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/Fer140421/PROYECTO--URBANS-SIGNS.git
cd PROYECTO--URBANS-SIGNS
```

### 2. Ejecutar el Backend (Spring Boot)
```bash
cd Backend---URBAN-SIGNS
# Configurar las variables de entorno en .env según .env.example
.\mvnw.cmd spring-boot:run
```
*El servicio se iniciará en `http://localhost:8080`.*

### 3. Ejecutar el Dashboard Administrativo (Angular)
```bash
cd ../Frontend---URBAN-SIGNS-DASHBOARD
npm install
ng serve --port 4200
```
*El dashboard estará disponible en `http://localhost:4200`.*

### 4. Ejecutar el Website / Portal Cliente (Angular)
```bash
cd ../Website---URBAN-SIGNS
npm install
ng serve --port 4201
```
*El sitio estará disponible en `http://localhost:4201`.*

---

## 🌐 Enlaces de Despliegue en Producción (Cloud Hosting)

> [!NOTE]
> Los siguientes enlaces corresponden a las instancias de producción desplegadas en la nube para la evaluación final:


- **Dashboard Administrativo (HTTPS):**  
  `https://frontend-urban-signs-dashboard.vercel.app/login` *(Placeholder)*

- **Website Portal de Consulta (HTTPS):**  
  `https://website-urban-signs.vercel.app/landing/home` *(Placeholder)*

---

## 📄 Licencia y Derechos
Desarrollado para **Urban Signs** — Tarija, Bolivia (2026).
