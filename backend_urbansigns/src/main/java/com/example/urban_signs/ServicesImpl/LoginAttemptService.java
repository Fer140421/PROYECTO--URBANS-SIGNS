package com.example.urban_signs.ServicesImpl;

import java.time.Duration;
import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.urban_signs.Model.UsersModel;
import com.example.urban_signs.Repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 10;

    private final UsersRepository usersRepository;

    @Transactional
    public Instant getActiveLockUntil(String username) {
        return usersRepository.findByUserAccesForUpdate(username)
                .map(this::getActiveLockUntil)
                .orElse(null);
    }

    @Transactional
    public Instant registerFailedAttempt(String username) {
        return usersRepository.findByUserAccesForUpdate(username).map(user -> {
            Instant now = Instant.now();
            Instant activeLockUntil = getActiveLockUntil(user);
            if (activeLockUntil != null) {
                return activeLockUntil;
            }

            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(now.plus(Duration.ofMinutes(LOCK_DURATION_MINUTES)));
            }
            return user.getLockedUntil();
        }).orElse(null);
    }

    @Transactional
    public void resetAttempts(String username) {
        usersRepository.findByUserAccesForUpdate(username).ifPresent(user -> {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
        });
    }

    private Instant getActiveLockUntil(UsersModel user) {
        Instant lockedUntil = user.getLockedUntil();
        if (lockedUntil == null) {
            return null;
        }
        if (lockedUntil.isAfter(Instant.now())) {
            return lockedUntil;
        }

        user.setLockedUntil(null);
        user.setFailedLoginAttempts(0);
        return null;
    }
}
