package com.example.urban_signs.config;

import java.lang.reflect.Method;
import java.util.Map;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import com.example.urban_signs.Services.SesionAccionService;
import com.example.urban_signs.Utils.Context.SesionContextHolder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** Registra una auditoría para toda operación HTTP que modifica información. */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditoriaAspect {

    private static final Map<String, String> MODULOS = Map.ofEntries(
            Map.entry("Category", "CATEGORÍAS"),
            Map.entry("Clientes", "CLIENTES"),
            Map.entry("Employee", "EMPLEADOS"),
            Map.entry("Supplier", "PROVEEDORES"),
            Map.entry("UnidadMedida", "UNIDADES DE MEDIDA"),
            Map.entry("MaterialProduccion", "MATERIALES DE PRODUCCIÓN"),
            Map.entry("Herramientas", "HERRAMIENTAS"),
            Map.entry("Lotes", "LOTES"),
            Map.entry("Pedidos", "PEDIDOS"),
            Map.entry("Cotizacion", "COTIZACIONES"),
            Map.entry("Compra", "COMPRAS"),
            Map.entry("OrdenImpresion", "ORDENES DE IMPRESIÓN"),
            Map.entry("PrestamoMaterialTrabajo", "PRÉSTAMOS DE MATERIALES"),
            Map.entry("DetallePrestamo", "DETALLE DE PRÉSTAMOS"),
            Map.entry("ResiduoMaterial", "RESIDUOS DE MATERIAL"),
            Map.entry("Trabajos", "TRABAJOS"),
            Map.entry("Planificacion", "PLANIFICACIÓN"),
            Map.entry("SolicitudCotizacion", "SOLICITUDES DE COTIZACIÓN"),
            Map.entry("Facturacion", "FACTURACIÓN"),
            Map.entry("People", "PERSONAS"),
            Map.entry("Permiso", "PERMISOS"),
            Map.entry("Users_roles", "ROLES DE USUARIO"),
            Map.entry("User", "USUARIOS"),
            Map.entry("Roles", "ROLES"),
            Map.entry("RolePermission", "PERMISOS DE ROL"),
            Map.entry("Session", "SESIONES"));

    private final SesionAccionService sesionAccionService;

    @Around("within(com.example.urban_signs.Controller..*) && execution(public * *(..))")
    public Object auditarOperacion(ProceedingJoinPoint joinPoint) throws Throwable {
        Object resultado = joinPoint.proceed();
        Method metodo = ((MethodSignature) joinPoint.getSignature()).getMethod();

        if (esOperacionDeEscritura(metodo) && fueExitosa(resultado)) {
            registrarAuditoria(joinPoint, metodo);
        }
        return resultado;
    }

    private boolean esOperacionDeEscritura(Method metodo) {
        return metodo.isAnnotationPresent(PostMapping.class)
                || metodo.isAnnotationPresent(PutMapping.class)
                || metodo.isAnnotationPresent(PatchMapping.class)
                || metodo.isAnnotationPresent(DeleteMapping.class);
    }

    private boolean fueExitosa(Object resultado) {
        return !(resultado instanceof ResponseEntity<?> response) || response.getStatusCode().is2xxSuccessful();
    }

    private void registrarAuditoria(ProceedingJoinPoint joinPoint, Method metodo) {
        try {
            Long idSesion = SesionContextHolder.getSesionId();
            if (idSesion == null) {
                return;
            }

            String modulo = obtenerModulo(joinPoint.getTarget().getClass());
            String accion = obtenerAccion(metodo);
            sesionAccionService.registrarAccion(idSesion,
                    String.format("Se ha %s en %s mediante %s.", accion, modulo, metodo.getName()), modulo);
        } catch (Exception e) {
            // Una falla al auditar nunca debe afectar la operación principal.
            log.error("No se pudo registrar la auditoría de {}: {}", metodo.getName(), e.getMessage(), e);
        }
    }

    private String obtenerAccion(Method metodo) {
        String nombreMetodo = metodo.getName().toLowerCase();
        if (metodo.isAnnotationPresent(DeleteMapping.class)
                || contieneAlguno(nombreMetodo, "delete", "eliminar", "baja")) {
            return "eliminado";
        }
        if (contieneAlguno(nombreMetodo, "cancelar")) return "cancelado";
        if (contieneAlguno(nombreMetodo, "activar")) return "activado";
        if (contieneAlguno(nombreMetodo, "completar")) return "completado";
        if (contieneAlguno(nombreMetodo, "confirmar")) return "confirmado";
        if (contieneAlguno(nombreMetodo, "reprogramar")) return "reprogramado";
        if (contieneAlguno(nombreMetodo, "reasignar")) return "reasignado";
        if (contieneAlguno(nombreMetodo, "devol")) return "devuelto";
        if (metodo.isAnnotationPresent(PutMapping.class) || metodo.isAnnotationPresent(PatchMapping.class)) return "modificado";
        return "registrado";
    }

    private boolean contieneAlguno(String texto, String... terminos) {
        for (String termino : terminos) {
            if (texto.contains(termino)) return true;
        }
        return false;
    }

    private String obtenerModulo(Class<?> controllerClass) {
        String nombre = controllerClass.getSimpleName().replace("Controller", "");
        return MODULOS.getOrDefault(nombre, nombre.replaceAll("([a-z])([A-Z])", "$1 $2").toUpperCase());
    }
}
