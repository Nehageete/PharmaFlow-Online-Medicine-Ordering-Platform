package com.pharmaflow.exception;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.pharmaflow.dto.response.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFoundException(ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND) // 404
                .body(new ApiResponse(e.getMessage(), "Failed"));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse> handleDuplicateResourceException(DuplicateResourceException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT) // 409
                .body(new ApiResponse(e.getMessage(), "Failed"));
    }

    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ApiResponse> handleInvalidOperationException(InvalidOperationException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST) // 400
                .body(new ApiResponse(e.getMessage(), "Failed"));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED) // 401
                .body(new ApiResponse("Invalid email or password", "Failed"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDeniedException(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN) // 403
                .body(new ApiResponse("You are not authorized to perform this action", "Failed"));
    }

    // bean validation errors (@Valid on request DTOs) - returns field -> message map
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(code = HttpStatus.BAD_REQUEST)
    public Map<String, String> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        List<FieldError> fieldErrors = e.getFieldErrors();
        return fieldErrors.stream()
                .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage, (a, b) -> a));
    }

    // wrong type on a path variable or query param - e.g. GET /orders/status/NOT_A_STATUS,
    // or a non-numeric id in GET /medicines/{medicineId}. Without this, Spring's default
    // handling of these falls through to the catch-all below and reports them as SC 500,
    // even though they're really a bad request from the client (SC 400).
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e) {
        String message = String.format("Invalid value '%s' for parameter '%s'", e.getValue(), e.getName());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST) // 400
                .body(new ApiResponse(message, "Failed"));
    }

    // a required @RequestParam is missing - e.g. GET /medicines/search with no ?name=
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse> handleMissingServletRequestParameterException(MissingServletRequestParameterException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST) // 400
                .body(new ApiResponse(e.getMessage(), "Failed"));
    }

    // prescription file bigger than spring.servlet.multipart.max-file-size
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST) // 400
                .body(new ApiResponse("Uploaded file is too large", "Failed"));
    }

    // DB-level unique constraint violation slipping past our own existsBy... pre-checks -
    // e.g. two near-simultaneous requests both pass the "does this review already exist?"
    // check before either has committed. The DB constraint (already defined on your Review
    // and WishlistItem entities) is the real safety net; this just turns that low-level
    // SQL failure into the same clean ApiResponse shape as everything else, instead of SC 500.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT) // 409
                .body(new ApiResponse("This action conflicts with existing data (e.g. a duplicate entry)", "Failed"));
    }

    // catch-all - anything not handled above
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) // 500
                .body(new ApiResponse(e.getMessage(), "Failed"));
    }
}
