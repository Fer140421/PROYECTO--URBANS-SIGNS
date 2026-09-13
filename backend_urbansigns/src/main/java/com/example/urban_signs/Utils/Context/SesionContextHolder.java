package com.example.urban_signs.Utils.Context;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class SesionContextHolder {

    private static final ThreadLocal<Long> sessionIdHolder = new ThreadLocal<>();

    /**
     * Guarda el id_sesion en el contexto del thread actual.
     * Se llama desde JwtAuthorizationFilter al validar el token.
     */
    public static void setSesionId(Long idSesion) {
        if (idSesion == null) {
            log.warn("Intentando establecer id_sesion nulo en el contexto");
            return;
        }
        sessionIdHolder.set(idSesion);
        log.debug("ID de sesión establecido en contexto: {}", idSesion);
    }

    /**
     * Obtiene el id_sesion del contexto actual.
     * Se usa desde los Services para auditar acciones.
     * 
     * @return id_sesion o null si no hay sesión en el contexto
     */
    public static Long getSesionId() {
        Long idSesion = sessionIdHolder.get();
        if (idSesion == null) {
            log.warn("No hay id_sesion en el contexto del thread actual");
        }
        return idSesion;
    }

    /**
     * Limpia el contexto del thread actual.
     * CRÍTICO: Se llama al final de cada request para evitar memory leaks.
     */
    public static void clear() {
        sessionIdHolder.remove();
        log.debug("Contexto de sesión limpiado");
    }

    /**
     * Verifica si existe una sesión en el contexto actual.
     */
    public static boolean hasSesion() {
        return sessionIdHolder.get() != null;
    }
}