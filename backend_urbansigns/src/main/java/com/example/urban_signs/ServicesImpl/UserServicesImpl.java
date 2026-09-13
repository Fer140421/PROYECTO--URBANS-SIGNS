package com.example.urban_signs.ServicesImpl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Services.UserServices;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServicesImpl implements UserServices {

    private final UsersRepository usersRepository;
    private final JavaMailSender mailSender;

    @Override
    public List<UsersModel> findAll() {
        return usersRepository.findAll();
    }

    @Override
    public void sendVerificationCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Verificación de correo - Urban Signs");

        String body = "Hola,\n\n" +
                "Bienvenido(a) a Urban Signs.\n\n" +
                "Para completar tu registro como empleado, por favor verifica tu dirección de correo electrónico ingresando el siguiente código:\n\n"
                +
                "🔸 Código de verificación: " + code + "\n\n" +
                "Este código tiene una validez de 5 minutos.\n\n" +
                "Si no realizaste este registro, puedes ignorar este mensaje.\n\n" +
                "Atentamente,\n" +
                "Equipo de Urban Signs\n" +
                "-------------------------------------\n" +
                "Este es un mensaje automático, por favor no respondas a este correo.";

        message.setText(body);
        mailSender.send(message);
    }

    @Override
    public boolean existsUser(String userAcces) {
        return usersRepository.existsByUserAcces(userAcces);
    }

    @Override
    public void sendEmployeeCredentials(String toEmail, String nombreCompleto, String username, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Bienvenido a Urban Signs - Tus credenciales de acceso");

        String body = "Hola " + nombreCompleto + ",\n\n" +
                "¡Bienvenido(a) al equipo de Urban Signs! 🎉\n\n" +
                "Tu cuenta de empleado ha sido creada exitosamente. A continuación encontrarás tus credenciales de acceso al sistema:\n\n"
                +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "👤 Usuario: " + username + "\n" +
                "🔑 Contraseña: " + password + "\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "⚠️ IMPORTANTE:\n" +
                "• Esta contraseña ha sido generada automáticamente\n" +
                "• Te recomendamos cambiarla en tu primer inicio de sesión\n" +
                "• Guarda estas credenciales en un lugar seguro\n" +
                "• No compartas tu contraseña con nadie\n\n" +
                "Para acceder al sistema, ingresa a: [URL_DE_TU_SISTEMA]\n\n" +
                "Si tienes alguna duda o problema para acceder, contacta con el administrador del sistema.\n\n" +
                "Atentamente,\n" +
                "Equipo de Urban Signs\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "Este es un mensaje automático, por favor no respondas a este correo.";

        message.setText(body);
        mailSender.send(message);
    }

    @Override
    public void sendRecoveryCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Recuperación de contraseña - Urban Signs");

        String body = "Hola,\n\n" +
                "Has solicitado recuperar tu contraseña en Urban Signs.\n\n" +
                "Tu código de recuperación es:\n\n" +
                "🔸 Código: " + code + "\n\n" +
                "Este código expirará en 5 minutos.\n\n" +
                "Si no solicitaste este cambio, ignora este mensaje.\n\n" +
                "Atentamente,\n" +
                "Equipo de Urban Signs\n" +
                "-------------------------------------\n" +
                "Este es un mensaje automático, por favor no respondas a este correo.";

        message.setText(body);
        mailSender.send(message);
    }

    @Override
    public Map<String, Object> verificarEmailParaRecuperacion(String userAcces) {
        Map<String, Object> response = new HashMap<>();

        // Buscar el usuario por email
        Optional<UsersModel> usuarioOpt = usersRepository.findByUserAcces(userAcces);

        if (!usuarioOpt.isPresent()) {
            // El email no existe en el sistema
            response.put("existe", false);
            response.put("activo", false);
            response.put("valido", false);
            response.put("mensaje", "El correo electrónico no está registrado en el sistema");
            return response;
        }

        UsersModel usuario = usuarioOpt.get();

        if (!usuario.isState_user()) {
            // El usuario existe pero está inactivo
            response.put("existe", true);
            response.put("activo", false);
            response.put("valido", false);
            response.put("mensaje", "Tu cuenta está inactiva. Contacta con soporte para más información");
            return response;
        }

        // El usuario existe y está activo
        response.put("existe", true);
        response.put("activo", true);
        response.put("valido", true);
        response.put("mensaje", "Correo válido. Se enviará el código de verificación");

        return response;
    }

    @Override
    public Optional<UsersModel> buscarPorEmail(String userAcces) {
        return usersRepository.findByUserAcces(userAcces);
    }

    //pendiente
    @Override
    public void sendUpdatedCredentials(String toEmail, String nombreCompleto, String newEmail, String newPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Tus credenciales de acceso han sido actualizadas");

        String body = "Hola " + nombreCompleto + ",\n\n" +
                "Tus credenciales de acceso han sido actualizadas exitosamente. A continuación encontrarás la información actualizada:\n\n"
                +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "👤 Usuario (Correo): " + newEmail + "\n" +
                "🔑 Nueva Contraseña: " + newPassword + "\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "⚠️ IMPORTANTE:\n" +
                "• Esta contraseña ha sido actualizada por ti\n" +
                "• Guarda estas credenciales en un lugar seguro\n" +
                "• No compartas tu contraseña con nadie\n\n" +
                "Para acceder al sistema, ingresa a: [URL_DE_TU_SISTEMA]\n\n" +
                "Si tienes alguna duda o problema para acceder, contacta con el administrador del sistema.\n\n" +
                "Atentamente,\n" +
                "Equipo de Urban Signs\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "Este es un mensaje automático, por favor no respondas a este correo.";

        message.setText(body);
        mailSender.send(message);
    }

}
