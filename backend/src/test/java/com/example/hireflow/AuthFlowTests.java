package com.example.hireflow;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthFlowTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void employeeAndEmployerLoginsReturnSeparateRoleProtectedTokens() throws Exception {
        mockMvc.perform(get("/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));

        mockMvc.perform(get("/api/employee/profile"))
            .andExpect(status().isUnauthorized());

        String uniqueId = UUID.randomUUID().toString();
        String employeeEmail = "employee-" + uniqueId + "@example.com";
        String employerEmail = "employer-" + uniqueId + "@example.com";
        String password = "TemporaryPass123!";

        register("""
            {
              "email": "%s",
              "password": "%s",
              "role": "EMPLOYEE",
              "displayName": "JWT Test",
              "fullName": "JWT Test"
            }
            """.formatted(employeeEmail, password));
        register("""
            {
              "email": "%s",
              "password": "%s",
              "role": "EMPLOYER",
              "displayName": "JWT Company",
              "companyName": "JWT Company"
            }
            """.formatted(employerEmail, password));

        String employeeToken = login(employeeEmail, password, "EMPLOYEE");
        String employerToken = login(employerEmail, password, "EMPLOYER");

        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(employeeToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value(employeeEmail))
            .andExpect(jsonPath("$.role").value("EMPLOYEE"))
            .andExpect(jsonPath("$.token").isEmpty());

        mockMvc.perform(get("/api/employee/profile").header("Authorization", bearer(employeeToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fullName").value("JWT Test"));

        mockMvc.perform(get("/api/employer/jobs").header("Authorization", bearer(employeeToken)))
            .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/employer/jobs").header("Authorization", bearer(employerToken)))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/employee/profile").header("Authorization", bearer(employerToken)))
            .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer invalid-token"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void employerCanCloseAndDeleteOnlyTheirClosedJobs() throws Exception {
        String uniqueId = UUID.randomUUID().toString();
        String password = "TemporaryPass123!";
        String employerEmail = "job-owner-" + uniqueId + "@example.com";
        String otherEmployerEmail = "other-owner-" + uniqueId + "@example.com";
        String employeeEmail = "job-applicant-" + uniqueId + "@example.com";

        register("""
            {
              "email": "%s",
              "password": "%s",
              "role": "EMPLOYER",
              "displayName": "Job Owner",
              "companyName": "Job Owner Company"
            }
            """.formatted(employerEmail, password));
        register("""
            {
              "email": "%s",
              "password": "%s",
              "role": "EMPLOYER",
              "displayName": "Other Employer",
              "companyName": "Other Employer Company"
            }
            """.formatted(otherEmployerEmail, password));
        register("""
            {
              "email": "%s",
              "password": "%s",
              "role": "EMPLOYEE",
              "displayName": "Job Applicant",
              "fullName": "Job Applicant"
            }
            """.formatted(employeeEmail, password));

        String employerToken = login(employerEmail, password, "EMPLOYER");
        String otherEmployerToken = login(otherEmployerEmail, password, "EMPLOYER");
        String employeeToken = login(employeeEmail, password, "EMPLOYEE");
        String employerAuth = bearer(employerToken);
        String jobRequest = """
            {
              "title": "Hiring Test",
              "description": "A role for lifecycle testing.",
              "requirements": "",
              "location": "Remote",
              "employmentType": "FULL_TIME",
              "salaryMin": 50000,
              "salaryMax": 70000
            }
            """;

        MvcResult createdJob = mockMvc.perform(post("/api/employer/jobs")
                .header("Authorization", employerAuth)
                .contentType(MediaType.APPLICATION_JSON)
                .content(jobRequest))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("OPEN"))
            .andReturn();
        JsonNode job = objectMapper.readTree(createdJob.getResponse().getContentAsString());
        long jobId = job.get("id").asLong();

        mockMvc.perform(delete("/api/employer/jobs/{jobId}", jobId)
                .header("Authorization", employerAuth))
            .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/employee/jobs/{jobId}/applications", jobId)
                .header("Authorization", bearer(employeeToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"coverLetter\":\"I am interested.\"}"))
            .andExpect(status().isCreated());

        mockMvc.perform(patch("/api/employer/jobs/{jobId}/status", jobId)
                .header("Authorization", employerAuth)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"CLOSED\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CLOSED"));

        mockMvc.perform(get("/api/employer/jobs/{jobId}/applications", jobId)
                .header("Authorization", employerAuth))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].coverLetter").value("I am interested."));

        mockMvc.perform(post("/api/employee/jobs/{jobId}/applications", jobId)
                .header("Authorization", bearer(employeeToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"coverLetter\":\"I am interested.\"}"))
            .andExpect(status().isBadRequest());

        mockMvc.perform(delete("/api/employer/jobs/{jobId}", jobId)
                .header("Authorization", bearer(otherEmployerToken)))
            .andExpect(status().isBadRequest());

        mockMvc.perform(delete("/api/employer/jobs/{jobId}", jobId)
                .header("Authorization", employerAuth))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/jobs/{jobId}", jobId))
            .andExpect(status().isBadRequest());
    }

    private void register(String requestBody) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isOk());
    }

    private String login(String email, String password, String expectedRole) throws Exception {
        String requestBody = """
            {
              "email": "%s",
              "password": "%s"
            }
            """.formatted(email, password);

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token", not(blankOrNullString())))
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.role").value(expectedRole))
            .andReturn();

        JsonNode response = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        return response.get("token").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
