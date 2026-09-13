package com.example.urban_signs.config;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import com.example.urban_signs.DTO.Users.VerificationData;

public class VerificationStorage {
    private static final Map<String, VerificationData> codes = new ConcurrentHashMap<>();
    private static final Set<String> verifiedUsers = ConcurrentHashMap.newKeySet();

    public static void saveCode(String email, String code) {
        codes.put(email, new VerificationData(code, LocalDateTime.now().plusMinutes(5)));
    }

    public static boolean isCodeValid(String email, String code) {
        VerificationData data = codes.get(email);
        if (data == null || !data.getCode().equals(code) || LocalDateTime.now().isAfter(data.getExpiresAt())) {
            return false;
        }
        codes.remove(email);
        return true;
    }

    public static boolean hasActiveCode(String email) {
        return codes.containsKey(email);
    }

    public static void markVerified(String email) {
        verifiedUsers.add(email);
    }

    public static boolean isVerified(String email) {
        return verifiedUsers.contains(email);
    }

    public static boolean consumeVerified(String email) {
        return verifiedUsers.remove(email);
    }
}
