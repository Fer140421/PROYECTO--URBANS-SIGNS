package com.example.urban_signs.config.exception;

import java.time.Instant;

import org.springframework.security.core.AuthenticationException;

import lombok.Getter;

@Getter
public class AccountTemporarilyLockedException extends AuthenticationException {

    private final Instant lockedUntil;

    public AccountTemporarilyLockedException(Instant lockedUntil) {
        super("Cuenta bloqueada temporalmente");
        this.lockedUntil = lockedUntil;
    }
}
