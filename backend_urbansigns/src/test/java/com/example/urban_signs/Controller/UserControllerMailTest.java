package com.example.urban_signs.Controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.urban_signs.DTO.Users.EmailRequest;
import com.example.urban_signs.Repository.SessionRepository;
import com.example.urban_signs.Repository.UsersRepository;
import com.example.urban_signs.Services.RefreshTokenService;
import com.example.urban_signs.Services.UserServices;
import com.example.urban_signs.config.JwtCookieService;
import com.example.urban_signs.config.VerificationStorage;
import com.example.urban_signs.config.jwt.JwtUtils;

@ExtendWith(MockitoExtension.class)
class UserControllerMailTest {
    @Mock UserServices userServices;
    @Mock SessionRepository sessions;
    @Mock UsersRepository users;
    @Mock JwtUtils jwt;
    @Mock PasswordEncoder encoder;
    @Mock RefreshTokenService refresh;
    @Mock JwtCookieService cookies;
    @InjectMocks UserController controller;

    @Test
    void authenticationFailureReturnsServiceErrorWithoutPublishingCode() {
        EmailRequest request = request("smtp-auth-test@example.invalid");
        doThrow(new MailAuthenticationException("sensitive provider details"))
                .when(userServices).sendVerificationCode(eq(request.getEmail()), anyString());
        var response = controller.sendVerificationCode(request);
        assertEquals(503, response.getStatusCode().value());
        assertEquals("MAIL_AUTH_FAILED", ((Map<?, ?>) response.getBody()).get("code"));
        assertFalse(response.getBody().toString().contains("sensitive"));
        assertFalse(VerificationStorage.hasActiveCode(request.getEmail()));
    }

    @Test
    void deliveryFailureDoesNotPublishCode() {
        EmailRequest request = request("smtp-delivery-test@example.invalid");
        doThrow(new MailSendException("provider unreachable"))
                .when(userServices).sendVerificationCode(eq(request.getEmail()), anyString());
        var response = controller.sendVerificationCode(request);
        assertEquals(503, response.getStatusCode().value());
        assertEquals("MAIL_DELIVERY_FAILED", ((Map<?, ?>) response.getBody()).get("code"));
        assertFalse(VerificationStorage.hasActiveCode(request.getEmail()));
    }

    @Test
    void successfullySentCodeCanBeVerified() {
        EmailRequest request = request("smtp-success-test@example.invalid");
        var code = org.mockito.ArgumentCaptor.forClass(String.class);
        assertEquals(200, controller.sendVerificationCode(request).getStatusCode().value());
        verify(userServices).sendVerificationCode(eq(request.getEmail()), code.capture());
        request.setCode(code.getValue());
        assertEquals(200, controller.verifyCode(request).getStatusCode().value());
        assertTrue(VerificationStorage.consumeVerified(request.getEmail()));
    }

    private EmailRequest request(String email) {
        EmailRequest request = new EmailRequest();
        request.setEmail(email);
        return request;
    }
}
