package com.example.urban_signs.ServicesImpl;

import java.time.format.DateTimeFormatter;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.example.urban_signs.Model.ClienteModel;
import com.example.urban_signs.Model.CotizacionModel;
import com.example.urban_signs.Services.PortalNotificacionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PortalNotificacionServiceImpl implements PortalNotificacionService {

    private final JavaMailSender mailSender;

    @Override
    @Async
    public void enviarNotificacionCotizacionLista(CotizacionModel cotizacion) {
        if (cotizacion == null || cotizacion.getSolicitud() == null) {
            return;
        }
        ClienteModel cliente = cotizacion.getSolicitud().getCliente();
        String correo = resolverCorreo(cliente);
        if (correo == null || correo.isBlank()) {
            log.info("No se encontró correo para notificar al cliente de la cotización {}", cotizacion.getCodCotizacion());
            return;
        }

        try {
            String nombre = resolverNombre(cliente);
            String fechaCaducidadStr = cotizacion.getFechaCaducado() != null
                    ? cotizacion.getFechaCaducado().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                    : "15 días calendario";

            String codSolicitud = cotizacion.getSolicitud().getCodSolicitud() != null
                    ? cotizacion.getSolicitud().getCodSolicitud()
                    : "—";

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(correo);
            message.setSubject("¡Tu cotización está lista! - Urban Signs SRL");

            String body = "Hola " + nombre + ",\n\n" +
                    "Te informamos que el taller técnico de Urban Signs SRL ha preparado tu presupuesto formal.\n\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                    "📋 Código de Cotización: " + cotizacion.getCodCotizacion() + "\n" +
                    "🏷️ Solicitud de Referencia: " + codSolicitud + "\n" +
                    "💰 Costo Total: Bs. " + (cotizacion.getCostoTotal() != null ? cotizacion.getCostoTotal() : "0.00") + "\n" +
                    "⏳ Plazo de vigencia: " + fechaCaducidadStr + "\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                    "Ya puedes ingresar a tu portal de clientes en nuestro sitio web para:\n" +
                    "  1. Revisar las medidas, especificaciones y costos detallados.\n" +
                    "  2. Aprobar tu cotización formalmente con un solo clic.\n\n" +
                    "Ingresa a tu portal en la sección 'Mi Portal' o 'Cotizaciones' de nuestra plataforma web.\n\n" +
                    "Si requieres alguna modificación o aclaración técnica, estamos a tu entera disposición.\n\n" +
                    "Atentamente,\n" +
                    "Equipo de Ventas y Producción\n" +
                    "Urban Signs SRL\n" +
                    "----------------------------------------------------\n" +
                    "Este es un mensaje automático de notificación del sistema.";

            message.setText(body);
            mailSender.send(message);
            log.info("Notificación de cotización lista enviada exitosamente a {}", correo);
        } catch (Exception e) {
            log.warn("No se pudo enviar el correo de cotización lista a {}: {}", correo, e.getMessage());
        }
    }

    @Override
    @Async
    public void enviarNotificacionCotizacionAprobada(CotizacionModel cotizacion) {
        if (cotizacion == null || cotizacion.getSolicitud() == null) {
            return;
        }
        ClienteModel cliente = cotizacion.getSolicitud().getCliente();
        String correo = resolverCorreo(cliente);
        if (correo == null || correo.isBlank()) {
            return;
        }

        try {
            String nombre = resolverNombre(cliente);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(correo);
            message.setSubject("¡Cotización aprobada exitosamente! - Urban Signs SRL");

            String body = "Hola " + nombre + ",\n\n" +
                    "¡Excelente noticia! Has aprobado exitosamente la cotización " + cotizacion.getCodCotizacion() + " desde el portal de clientes.\n\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                    "📋 Cotización Aprobada: " + cotizacion.getCodCotizacion() + "\n" +
                    "💰 Monto Total Acordado: Bs. " + (cotizacion.getCostoTotal() != null ? cotizacion.getCostoTotal() : "0.00") + "\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                    "El equipo de producción y taller ha sido notificado para programar la fabricación de tu pedido.\n" +
                    "Podrás consultar el avance de tus proyectos en la pestaña 'Mis pedidos' de tu portal.\n\n" +
                    "¡Muchas gracias por tu confianza en Urban Signs SRL!\n\n" +
                    "Atentamente,\n" +
                    "Urban Signs SRL";

            message.setText(body);
            mailSender.send(message);
            log.info("Notificación de cotización aprobada enviada a {}", correo);
        } catch (Exception e) {
            log.warn("No se pudo enviar el correo de confirmación de aprobación a {}: {}", correo, e.getMessage());
        }
    }

    private String resolverCorreo(ClienteModel cliente) {
        if (cliente == null) return null;
        if (cliente.getCorreo() != null && !cliente.getCorreo().isBlank()) {
            return cliente.getCorreo().trim();
        }
        if (cliente.getUsuario() != null && cliente.getUsuario().getUserAcces() != null && cliente.getUsuario().getUserAcces().contains("@")) {
            return cliente.getUsuario().getUserAcces().trim();
        }
        return null;
    }

    private String resolverNombre(ClienteModel cliente) {
        if (cliente == null) return "Estimado(a) Cliente";
        if ("EMPRESA".equalsIgnoreCase(cliente.getTipoClientePersonaEmpresa()) && cliente.getEmpresa() != null) {
            return cliente.getEmpresa().getRazonSocial();
        }
        if (cliente.getPersona() != null) {
            String nom = cliente.getPersona().getName_people() != null ? cliente.getPersona().getName_people().trim() : "";
            String ap = cliente.getPersona().getAp() != null ? cliente.getPersona().getAp().trim() : "";
            String res = (nom + " " + ap).trim();
            if (!res.isBlank()) return res;
        }
        return "Estimado(a) Cliente";
    }
}
