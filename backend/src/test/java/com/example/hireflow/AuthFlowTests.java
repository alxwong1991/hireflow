package com.example.hireflow;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
