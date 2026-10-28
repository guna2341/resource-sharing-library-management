package com.library.Resource.Sharing.Library.Management.exception;

import com.library.Resource.Sharing.Library.Management.dto.response.ApiResponse;
import com.library.Resource.Sharing.Library.Management.dto.response.FieldErrorResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import tools.jackson.databind.exc.InvalidFormatException;
import tools.jackson.databind.exc.UnrecognizedPropertyException;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {

        List<FieldErrorResponse> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new FieldErrorResponse(error.getField(), error.getDefaultMessage()))
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Validation error");
        response.put("errors", errors);

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse> handleConstraintViolation(
            ConstraintViolationException ex) {

        String message = ex.getConstraintViolations()
                .stream()
                .map(ConstraintViolation::getMessage)
                .findFirst()
                .orElse("Validation failed");

        ApiResponse response = new ApiResponse(false, message);

        return ResponseEntity.badRequest().body(response);
    }

//    User side exceptions
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse> handleUserAlreadyExistsException(DuplicateResourceException ex) {
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(BadRequest.class)
    public ResponseEntity<ApiResponse> handleBadRequest(BadRequest ex) {
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse> handleInvalidCredentialsException(InvalidCredentialsException ex) {
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse> handleUnAuthorizedException(UnauthorizedException ex) {
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleUserNotFoundException(ResourceNotFoundException ex) {
        ApiResponse response = new ApiResponse(false, ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse> handleNoResourceFoundException(NoResourceFoundException ex) {
        ApiResponse response = new ApiResponse(false, "Resource not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMessageNotReadable(
            HttpMessageNotReadableException ex) {

        Map<String, Object> response = new HashMap<>();
        Throwable cause = ex.getCause();

        if (cause instanceof UnrecognizedPropertyException unknownProperty) {

            response.put("error", "Unexpected field");
            response.put("field", unknownProperty.getPropertyName());
            response.put(
                    "message",
                    "Field '" + unknownProperty.getPropertyName() + "' is not allowed"
            );

        } else if (cause instanceof InvalidFormatException invalidFormat) {

            String field = invalidFormat.getPath()
                    .getLast()
                    .getPropertyName();

            Class<?> targetType = invalidFormat.getTargetType();

            if (targetType.isEnum()) {

                Object[] enumValues = targetType.getEnumConstants();

                response.put("error", "Invalid enum value");
                response.put("field", field);
                response.put(
                        "message",
                        "Invalid value for field '" + field +
                                "'. Allowed values: " +
                                Arrays.toString(enumValues)
                );

            } else {

                response.put("error", "Invalid field value");
                response.put("field", field);
                response.put(
                        "message",
                        "Invalid value provided for field '" + field + "'"
                );
            }

        } else {

            response.put("error", "Invalid request");
            response.put(
                    "message",
                    "Request body is invalid or has missing fields"
            );
            response.put("requiredFields", List.of(
                    "email",
                    "password"
            ));
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleException(Exception ex) {

        ApiResponse response = new ApiResponse(false, ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

}
