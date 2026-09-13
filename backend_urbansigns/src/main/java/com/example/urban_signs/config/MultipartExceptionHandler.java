package com.example.urban_signs.config;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

@RestControllerAdvice
public class MultipartExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> invalidFile(IllegalArgumentException exception) {
        return error(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<Map<String, String>> missingPart(MissingServletRequestPartException exception) {
        return error(HttpStatus.BAD_REQUEST, "Falta la parte multipart requerida: " + exception.getRequestPartName());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> fileTooLarge() {
        return error(HttpStatus.PAYLOAD_TOO_LARGE, "La imagen supera el tamaño máximo permitido de 5 MB");
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<Map<String, String>> invalidMultipart(MultipartException exception) {
        return error(HttpStatus.BAD_REQUEST, "La petición multipart/form-data no es válida");
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}
