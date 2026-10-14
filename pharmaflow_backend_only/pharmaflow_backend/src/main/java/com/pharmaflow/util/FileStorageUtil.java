package com.pharmaflow.util;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.pharmaflow.exception.InvalidOperationException;
import com.pharmaflow.exception.ResourceNotFoundException;

import jakarta.annotation.PostConstruct;

@Component
public class FileStorageUtil {

    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of("image/jpeg", "image/png", "image/webp", "application/pdf");

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path storageLocation;

    @PostConstruct
    public void init() {
        storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    // Saves the prescription image with a random file name (avoids collisions/overwrites)
    // and returns the relative path stored on the Order entity's prescriptionPath field.
    public String storePrescriptionFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException("Prescription file is required for this order");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new InvalidOperationException("Prescription must be a JPEG, PNG, WEBP image or a PDF");
        }

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + extension;

        try {
            Path targetPath = storageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath);
            return uploadDir + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store prescription file", e);
        }
    }

    // Loads a previously stored prescription file back as a Resource, for streaming over HTTP.
    // relativePath is whatever was saved on Order.prescriptionPath (uploadDir + "/" + fileName) -
    // only the file name portion is trusted/used here to resolve against storageLocation, so a
    // malicious/garbled path stored elsewhere can't be used to escape the upload directory.
    public Resource loadFileAsResource(String relativePath) {
        try {
            String fileName = Paths.get(relativePath).getFileName().toString();
            Path filePath = storageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new ResourceNotFoundException("Prescription file not found on server");
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Prescription file not found on server");
        }
    }

    // Best-effort content type detection (falls back to a generic binary type) so the browser
    // knows how to render/download the file (image preview vs. PDF viewer vs. plain download).
    public String probeContentType(Resource resource) {
        try {
            String contentType = Files.probeContentType(resource.getFile().toPath());
            return contentType != null ? contentType : "application/octet-stream";
        } catch (IOException e) {
            return "application/octet-stream";
        }
    }
}
