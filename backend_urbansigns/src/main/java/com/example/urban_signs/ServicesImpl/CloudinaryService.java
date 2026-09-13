package com.example.urban_signs.ServicesImpl;

import java.io.IOException;
import java.net.URI;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private static final long MAX_IMAGE_SIZE = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file, com.example.urban_signs.Utils.Enum.CloudinaryFolder folder) {
        return uploadFile(file, folder.getFolderName());
    }

    public String uploadFile(MultipartFile file, String tipoEntidad) {
        byte[] content;
        try {
            content = validateImage(file);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo leer la imagen", e);
        }

        try {
            String folderName = tipoEntidad + "/" + LocalDate.now();
            String fileName = UUID.randomUUID().toString();

            Map uploadResult = cloudinary.uploader().upload(
                    content,
                    ObjectUtils.asMap(
                            "folder", folderName,
                            "public_id", fileName,
                            "overwrite", true,
                            "resource_type", "image"));
            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null || !isValidHttpsUrl(secureUrl.toString())) {
                throw new IllegalStateException("Cloudinary no devolvió una URL HTTPS válida");
            }
            return secureUrl.toString();
        } catch (IOException | RuntimeException e) {
            throw new RuntimeException("Error al subir imagen a Cloudinary", e);
        }
    }

    private byte[] validateImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo de imagen está vacío");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("La imagen supera el tamaño máximo permitido de 5 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Tipo de imagen no permitido. Use JPEG, PNG, WEBP o GIF");
        }
        byte[] content = file.getBytes();
        if (!hasValidImageSignature(content, contentType.toLowerCase())) {
            throw new IllegalArgumentException("El contenido del archivo no corresponde a una imagen válida");
        }
        return content;
    }

    private boolean hasValidImageSignature(byte[] bytes, String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> bytes.length >= 3
                    && unsigned(bytes[0]) == 0xFF && unsigned(bytes[1]) == 0xD8 && unsigned(bytes[2]) == 0xFF;
            case "image/png" -> bytes.length >= 8
                    && unsigned(bytes[0]) == 0x89 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G'
                    && unsigned(bytes[4]) == 0x0D && unsigned(bytes[5]) == 0x0A
                    && unsigned(bytes[6]) == 0x1A && unsigned(bytes[7]) == 0x0A;
            case "image/gif" -> bytes.length >= 6 && bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F'
                    && bytes[3] == '8' && (bytes[4] == '7' || bytes[4] == '9') && bytes[5] == 'a';
            case "image/webp" -> bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I'
                    && bytes[2] == 'F' && bytes[3] == 'F' && bytes[8] == 'W' && bytes[9] == 'E'
                    && bytes[10] == 'B' && bytes[11] == 'P';
            default -> false;
        };
    }

    private int unsigned(byte value) {
        return value & 0xFF;
    }

    private boolean isValidHttpsUrl(String value) {
        try {
            URI uri = URI.create(value);
            return "https".equalsIgnoreCase(uri.getScheme()) && uri.getHost() != null;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

}
