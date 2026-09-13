package com.example.urban_signs.ServicesImpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.mail.MailSendException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.method.AuthorizationManagerBeforeMethodInterceptor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import com.example.urban_signs.Model.*;
import com.example.urban_signs.Repository.*;
import com.example.urban_signs.Services.UserServices;

class PasswordRecoveryServiceTest {
    UsersRepository users = mock(UsersRepository.class);
    PasswordRecoveryRepository recoveries = mock(PasswordRecoveryRepository.class);
    UserServices mail = mock(UserServices.class);
    PasswordEncoder encoder = mock(PasswordEncoder.class);
    Clock clock = mock(Clock.class);
    Instant now = Instant.parse("2026-09-11T00:00:00Z");
    Map<Long, PasswordRecoveryModel> rows = new HashMap<>();
    UsersModel user = UsersModel.builder().idUser(1L).userAcces("ana@example.com").state_user(true).build();
    PasswordRecoveryService service;
    String code;

    @BeforeEach void setup() {
        when(clock.instant()).thenAnswer(i -> now);
        when(users.findByUserAccesForUpdate("ana@example.com")).thenReturn(Optional.of(user));
        when(users.findById(1L)).thenReturn(Optional.of(user));
        when(recoveries.findById(anyLong())).thenAnswer(i -> Optional.ofNullable(rows.get(i.getArgument(0))));
        when(recoveries.save(any())).thenAnswer(i -> { PasswordRecoveryModel row = i.getArgument(0); rows.put(row.getUserId(), row); return row; });
        when(encoder.encode(anyString())).thenReturn("bcrypt-result");
        doAnswer(i -> { code = i.getArgument(1); return null; }).when(mail).sendRecoveryCode(anyString(), anyString());
        service = new PasswordRecoveryService(users, recoveries, mail, encoder, clock);
    }
    String issueToken() { service.send(user.getUserAcces()); return service.verify(user.getUserAcces(), code); }
    void reset(String token) { service.reset(user.getUserAcces(), token, "SecurePass123!"); }

    @Test void cannotResetWithOnlyAnEmail() {
        assertThrows(ResponseStatusException.class, () -> reset(null));
        verify(users, never()).save(any());
    }
    @Test void sendingCodeDoesNotAuthorizePasswordReset() {
        service.send(user.getUserAcces());
        assertThrows(ResponseStatusException.class, () -> reset("x".repeat(43)));
        verify(users, never()).save(any());
    }
    @Test void successStoresHashesAndConsumesToken() {
        String token = issueToken();
        assertEquals(43, token.length());
        assertNotEquals(token, rows.get(1L).getTokenHash());
        assertNull(rows.get(1L).getCodeHash());
        reset(token);
        assertEquals("bcrypt-result", user.getPasswordAcces());
        assertThrows(ResponseStatusException.class, () -> reset(token));
        verify(users, times(1)).save(user);
    }
    @Test void tokenCannotBeUsedForAnotherUser() {
        String token = issueToken();
        UsersModel other = UsersModel.builder().idUser(2L).userAcces("other@example.com").state_user(true).build();
        when(users.findByUserAccesForUpdate(other.getUserAcces())).thenReturn(Optional.of(other));
        assertThrows(ResponseStatusException.class, () -> service.reset(other.getUserAcces(), token, "SecurePass123!"));
        verify(users, never()).save(any());
    }
    @Test void wrongTokenDoesNotConsumeValidToken() {
        String token = issueToken();
        assertThrows(ResponseStatusException.class, () -> reset("x".repeat(43)));
        reset(token);
    }
    @Test void codeExpiresAtFiveMinutes() {
        service.send(user.getUserAcces());
        now = now.plusSeconds(300);
        assertThrows(ResponseStatusException.class, () -> service.verify(user.getUserAcces(), code));
    }
    @Test void tokenExpiresAtTenMinutes() {
        String token = issueToken();
        now = now.plusSeconds(600);
        assertThrows(ResponseStatusException.class, () -> reset(token));
        verify(users, never()).save(any());
    }
    @Test void codeCannotBeVerifiedTwice() {
        issueToken();
        assertThrows(ResponseStatusException.class, () -> service.verify(user.getUserAcces(), code));
    }
    @Test void fifthWrongAttemptLocksCode() {
        service.send(user.getUserAcces());
        for (int i = 0; i < 5; i++) assertThrows(ResponseStatusException.class, () -> service.verify(user.getUserAcces(), "000000"));
        assertEquals(5, rows.get(1L).getAttempts());
        assertThrows(ResponseStatusException.class, () -> service.verify(user.getUserAcces(), code));
    }
    @Test void resendCooldownAndInvalidation() {
        String token = issueToken();
        var error = assertThrows(ResponseStatusException.class, () -> service.send(user.getUserAcces()));
        assertEquals(429, error.getStatusCode().value());
        now = now.plusSeconds(60);
        service.send(user.getUserAcces());
        assertThrows(ResponseStatusException.class, () -> reset(token));
        reset(service.verify(user.getUserAcces(), code));
    }
    @Test void mailFailureDoesNotPublishCodeOrLeakProviderDetails() {
        doThrow(new MailSendException("secret provider detail")).when(mail).sendRecoveryCode(anyString(), anyString());
        var error = assertThrows(ResponseStatusException.class, () -> service.send(user.getUserAcces()));
        assertEquals(503, error.getStatusCode().value());
        assertFalse(error.getReason().contains("secret"));
        assertTrue(rows.isEmpty());
    }
    @Test void invalidPasswordsDoNotConsumeToken() {
        String token = issueToken();
        for (String password : new String[] { null, "short", "a".repeat(73), "é".repeat(37) })
            assertThrows(ResponseStatusException.class, () -> service.reset(user.getUserAcces(), token, password));
        reset(token);
    }
    @Test void inactiveAccountCannotRequestOrCompleteRecovery() {
        String token = issueToken();
        user.setState_user(false);
        assertThrows(ResponseStatusException.class, () -> service.send(user.getUserAcces()));
        assertThrows(ResponseStatusException.class, () -> reset(token));
        verify(users, never()).save(any());
    }
    @Test void administratorChangeInvalidatesRecovery() {
        String token = issueToken();
        service.adminReset(1L, "AdminPassword123!");
        assertThrows(ResponseStatusException.class, () -> reset(token));
    }
    @Test void adminMethodRejectsOrdinaryUserAndAllowsManager() {
        ProxyFactory factory = new ProxyFactory(service);
        factory.addAdvisor(AuthorizationManagerBeforeMethodInterceptor.preAuthorize());
        PasswordRecoveryService secured = (PasswordRecoveryService) factory.getProxy();
        try {
            SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("client", "", List.of(new SimpleGrantedAuthority("ROLE_Cliente"))));
            assertThrows(AccessDeniedException.class, () -> secured.adminReset(1L, "AdminPassword123!"));
            verify(users, never()).save(any());
            SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("manager", "", List.of(new SimpleGrantedAuthority("ROLE_Gerente"))));
            secured.adminReset(1L, "AdminPassword123!");
            verify(users).save(user);
        } finally { SecurityContextHolder.clearContext(); }
    }
}
