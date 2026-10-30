package com.example.hireflow;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import org.springframework.test.web.servlet.ResultActions;

import jakarta.transaction.Transactional;
import jakarta.persistence.EntityManager;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class NotificationFlowTests {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private EntityManager entityManager;

    @Test
    void notificationsArePrivatePersistentReadOnceAndDeletableOnlyAfterReading() throws Exception {
        mockMvc.perform(get("/api/notifications")).andExpect(status().isUnauthorized());
        mockMvc.perform(patch("/api/notifications/1/read")).andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/notifications/1")).andExpect(status().isUnauthorized());

        String employer = register("EMPLOYER");
        String employee = register("EMPLOYEE");
        String otherEmployee = register("EMPLOYEE");
        long jobId = createJob(employer);
        long applicationId = apply(employee, jobId);

        notifications(employee).andExpect(jsonPath("$.unreadCount").value(0));
        notifications(otherEmployee).andExpect(jsonPath("$.items.length()").value(0));
        notifications(employer)
            .andExpect(jsonPath("$.unreadCount").value(1))
            .andExpect(jsonPath("$.items[0].read").value(false))
            .andExpect(jsonPath("$.items[0].message", containsString("1 applicant so far")))
            .andExpect(jsonPath("$.items[0].targetPath").value("/employer/jobs/" + jobId + "/applications"));
        long firstId = body(notifications(employer)).get("items").get(0).get("id").asLong();

        mockMvc.perform(delete("/api/notifications/{id}", firstId).header("Authorization", employer))
            .andExpect(status().isBadRequest());
        mockMvc.perform(patch("/api/notifications/{id}/read", firstId).header("Authorization", employee))
            .andExpect(status().isBadRequest());
        mockMvc.perform(delete("/api/notifications/{id}", firstId).header("Authorization", otherEmployee))
            .andExpect(status().isBadRequest());
        notifications(employer).andExpect(jsonPath("$.unreadCount").value(1));

        apply(otherEmployee, jobId);
        notifications(employer)
            .andExpect(jsonPath("$.unreadCount").value(2))
            .andExpect(jsonPath("$.items[0].message", containsString("2 applicants so far")));
        long secondId = body(notifications(employer)).get("items").get(0).get("id").asLong();

        // A rejected duplicate application must not generate a notification.
        mockMvc.perform(post("/api/employee/jobs/{id}/applications", jobId)
                .header("Authorization", employee).contentType(MediaType.APPLICATION_JSON)
                .content("{\"coverLetter\":\"Duplicate\"}"))
            .andExpect(status().isBadRequest());
        for (int repeat = 0; repeat < 2; repeat++) {
            mockMvc.perform(patch("/api/notifications/{id}/read", firstId).header("Authorization", employer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.read").value(true));
            notifications(employer).andExpect(jsonPath("$.unreadCount").value(1));
        }
        entityManager.flush();
        entityManager.clear();
        notifications(employer).andExpect(jsonPath("$.unreadCount").value(1));
        mockMvc.perform(patch("/api/notifications/{id}/read", secondId).header("Authorization", employer))
            .andExpect(status().isOk());
        notifications(employer).andExpect(jsonPath("$.unreadCount").value(0));
        mockMvc.perform(delete("/api/notifications/{id}", firstId).header("Authorization", employer))
            .andExpect(status().isNoContent());
        notifications(employer).andExpect(jsonPath("$.items.length()").value(1));

        updateStatus(employer, jobId, applicationId, "APPLIED");
        notifications(employee).andExpect(jsonPath("$.unreadCount").value(0));
        updateStatus(employer, jobId, applicationId, "REVIEWING");
        updateStatus(employer, jobId, applicationId, "REVIEWING");
        notifications(employee)
            .andExpect(jsonPath("$.unreadCount").value(1))
            .andExpect(jsonPath("$.items[0].message", containsString("reviewing")))
            .andExpect(jsonPath("$.items[0].targetPath").value("/employee/applications#application-" + applicationId));
        notifications(otherEmployee).andExpect(jsonPath("$.unreadCount").value(0));
        mockMvc.perform(get("/api/employee/applications").header("Authorization", employee))
            .andExpect(status().isOk()).andExpect(jsonPath("$[0].status").value("REVIEWING"));

        long employeeNotification = body(notifications(employee)).get("items").get(0).get("id").asLong();
        mockMvc.perform(patch("/api/notifications/{id}/read", employeeNotification).header("Authorization", employee))
            .andExpect(status().isOk());
        notifications(employee).andExpect(jsonPath("$.unreadCount").value(0));
        mockMvc.perform(delete("/api/notifications/{id}", employeeNotification).header("Authorization", employee))
            .andExpect(status().isNoContent());
        notifications(employee).andExpect(jsonPath("$.items.length()").value(0));

        updateStatus(employer, jobId, applicationId, "ACCEPTED");
        mockMvc.perform(patch("/api/employer/jobs/{id}/status", jobId)
                .header("Authorization", employer).contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"CLOSED\"}"))
            .andExpect(status().isOk());
        // HTTP requests normally have separate persistence contexts; detach before testing DB cascades.
        entityManager.flush();
        entityManager.clear();
        mockMvc.perform(delete("/api/employer/jobs/{id}", jobId).header("Authorization", employer))
            .andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();
        notifications(employer).andExpect(jsonPath("$.items.length()").value(0));
        notifications(employee).andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void paginationCountsUnreadAcrossAllPagesAndOrdersNewestFirst() throws Exception {
        String employer = register("EMPLOYER");
        String employee = register("EMPLOYEE");
        long jobId = createJob(employer);
        long applicationId = apply(employee, jobId);
        for (int i = 0; i < 21; i++) {
            updateStatus(employer, jobId, applicationId, i % 2 == 0 ? "REVIEWING" : "SHORTLISTED");
        }
        notifications(employee)
            .andExpect(jsonPath("$.items.length()").value(20))
            .andExpect(jsonPath("$.unreadCount").value(21))
            .andExpect(jsonPath("$.hasMore").value(true));
        JsonNode firstPage = body(notifications(employee));
        long newestId = firstPage.get("items").get(0).get("id").asLong();
        for (int i = 1; i < firstPage.get("items").size(); i++) {
            assertTrue(firstPage.get("items").get(i - 1).get("id").asLong()
                > firstPage.get("items").get(i).get("id").asLong());
        }
        mockMvc.perform(patch("/api/notifications/{id}/read", newestId).header("Authorization", employee))
            .andExpect(status().isOk());
        mockMvc.perform(get("/api/notifications?page=1").header("Authorization", employee))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.unreadCount").value(20))
            .andExpect(jsonPath("$.hasMore").value(false));
        JsonNode secondPage = body(mockMvc.perform(get("/api/notifications?page=1")
            .header("Authorization", employee)).andExpect(status().isOk()));
        assertTrue(firstPage.get("items").get(19).get("id").asLong()
            > secondPage.get("items").get(0).get("id").asLong());
        mockMvc.perform(get("/api/notifications?page=2").header("Authorization", employee))
            .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(0));
        mockMvc.perform(get("/api/notifications?page=-1").header("Authorization", employee))
            .andExpect(status().isBadRequest());
    }

    private String register(String role) throws Exception {
        String email = UUID.randomUUID() + "@example.com";
        String password = "TemporaryPass123!";
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
            {"email":"%s","password":"%s","role":"%s","displayName":"Notification Test",
             "fullName":"Test Applicant","companyName":"Test Company"}
            """.formatted(email, password, role))).andExpect(status().isOk());
        JsonNode login = body(mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"email":"%s","password":"%s"}
                """.formatted(email, password))).andExpect(status().isOk()));
        return "Bearer " + login.get("token").asString();
    }

    private long createJob(String employer) throws Exception {
        return body(mockMvc.perform(post("/api/employer/jobs").header("Authorization", employer)
            .contentType(MediaType.APPLICATION_JSON).content("""
                {"title":"Notification Role","description":"Test role","employmentType":"FULL_TIME"}
                """)).andExpect(status().isCreated())).get("id").asLong();
    }

    private long apply(String employee, long jobId) throws Exception {
        return body(mockMvc.perform(post("/api/employee/jobs/{id}/applications", jobId)
            .header("Authorization", employee).contentType(MediaType.APPLICATION_JSON)
            .content("{\"coverLetter\":\"I am interested in this role.\"}"))
            .andExpect(status().isCreated())).get("id").asLong();
    }

    private void updateStatus(String employer, long jobId, long applicationId, String applicationStatus) throws Exception {
        mockMvc.perform(patch("/api/employer/jobs/{jobId}/applications/{applicationId}/status", jobId, applicationId)
            .header("Authorization", employer).contentType(MediaType.APPLICATION_JSON)
            .content("{\"status\":\"" + applicationStatus + "\"}")).andExpect(status().isOk());
    }

    private ResultActions notifications(String auth) throws Exception {
        return mockMvc.perform(get("/api/notifications").header("Authorization", auth)).andExpect(status().isOk());
    }

    private JsonNode body(ResultActions result) throws Exception {
        return objectMapper.readTree(result.andReturn().getResponse().getContentAsString());
    }
}
