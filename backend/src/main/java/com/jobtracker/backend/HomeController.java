package com.jobtracker.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Job Tracker backend is running!";
    }

    @GetMapping("/api/health")
    public String health() {
        return "Ok";
    }
}
