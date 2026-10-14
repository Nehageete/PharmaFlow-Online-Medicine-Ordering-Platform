package com.pharmaflow.dto.response;

import org.springframework.core.io.Resource;

// Not a typical JSON response DTO - carries the file Resource + metadata OrderController needs
// to build a proper file-streaming ResponseEntity (Content-Type, Content-Disposition filename).
public record PrescriptionFileResponse(Resource resource, String contentType, String filename) {
}
