package com.example.hireflow.common;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "message", "Welcome to HireFlow Backend!"
        );
    }

    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            return Map.of(
                    "status", "UP",
                    "backend", "HireFlow backend is running",
                    "database", "Database connection successful",
                    "dbCheck", result
            );
        } catch (Exception e) {
            return Map.of(
                    "status", "DOWN",
                    "backend", "HireFlow backend is running",
                    "database", "Database connection failed",
                    "error", e.getMessage()
            );
        }
    }
}