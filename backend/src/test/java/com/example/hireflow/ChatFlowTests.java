package com.example.hireflow;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ChatFlowTests {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private EntityManager entityManager;

    @ParameterizedTest
    @ValueSource(strings = {"REVIEWING", "SHORTLISTED", "ACCEPTED"})
    void eligibleStatusesUnlockPersistentPrivateChats(String eligibleStatus) throws Exception {
        String employer = register("EMPLOYER");
        String employee = register("EMPLOYEE");
        String outsider = register("EMPLOYEE");
        String otherEmployer = register("EMPLOYER");
        long job = createJob(employer);
        long application = apply(employee, job);

        mockMvc.perform(get("/api/chats")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/chats/{id}", application)).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/chats/{id}/messages", application)).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/chats/{id}/messages", application)
            .contentType(MediaType.APPLICATION_JSON).content("{\"body\":\"hello\"}"))
            .andExpect(status().isUnauthorized());
        mockMvc.perform(patch("/api/chats/{id}/read", application).param("throughMessageId", "1"))
            .andExpect(status().isUnauthorized());

        chats(employee).andExpect(jsonPath("$.length()").value(0));
        messages(employee, application).andExpect(status().isBadRequest());
        send(employer, application, "Not unlocked").andExpect(status().isBadRequest());
        updateStatus(employer, job, application, "REJECTED")
            .andExpect(jsonPath("$.chatEnabled").value(false));
        messages(employee, application).andExpect(status().isBadRequest());
        updateStatus(employer, job, application, eligibleStatus)
            .andExpect(jsonPath("$.chatEnabled").value(true));

        chats(employee).andExpect(jsonPath("$[0].applicationId").value(application))
            .andExpect(jsonPath("$[0].canSendMessages").value(true));
        chats(employer).andExpect(jsonPath("$[0].applicationId").value(application))
            .andExpect(jsonPath("$[0].canSendMessages").value(true));
        chats(outsider).andExpect(jsonPath("$.length()").value(0));
        chats(otherEmployer).andExpect(jsonPath("$.length()").value(0));
        for (String stranger : new String[] {outsider, otherEmployer}) {
            mockMvc.perform(get("/api/chats/{id}", application).header("Authorization", stranger))
                .andExpect(status().isBadRequest());
            messages(stranger, application).andExpect(status().isBadRequest());
            send(stranger, application, "Intrusion").andExpect(status().isBadRequest());
            markRead(stranger, application, 1).andExpect(status().isBadRequest());
        }
        send(employee, application, "My CV: https://example.com/cv; contact: applicant@example.com")
            .andExpect(status().isCreated()).andExpect(jsonPath("$.mine").value(true));
        entityManager.flush();
        entityManager.clear();
        messages(employer, application).andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].mine").value(false))
            .andExpect(jsonPath("$.items[0].body").value(
                "My CV: https://example.com/cv; contact: applicant@example.com"));

        updateStatus(employer, job, application, "REJECTED").andExpect(jsonPath("$.chatEnabled").value(true));
        entityManager.flush();
        entityManager.clear();
        long employerUnread = body(notifications(employer)).get("unreadCount").asLong();
        long employeeUnread = body(notifications(employee)).get("unreadCount").asLong();
        for (String participant : new String[] {employee, employer}) {
            chats(participant).andExpect(jsonPath("$[0].canSendMessages").value(false));
            mockMvc.perform(get("/api/chats/{id}", application).header("Authorization", participant))
                .andExpect(status().isOk()).andExpect(jsonPath("$.canSendMessages").value(false));
            send(participant, application, "Must not send after rejection")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                    "This application was rejected. You can view previous messages, but messaging is disabled."));
            messages(participant, application).andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1));
        }
        notifications(employer).andExpect(jsonPath("$.unreadCount").value(employerUnread));
        notifications(employee).andExpect(jsonPath("$.unreadCount").value(employeeUnread));
        long messageId = body(messages(employer, application)).get("items").get(0).get("id").asLong();
        markRead(employer, application, messageId).andExpect(status().isNoContent());
        notifications(employer).andExpect(jsonPath("$.unreadCount").value(employerUnread - 1));
        notifications(employee).andExpect(jsonPath("$.unreadCount").value(employeeUnread));

        updateStatus(employer, job, application, eligibleStatus);
        chats(employee).andExpect(jsonPath("$[0].canSendMessages").value(true));
        send(employee, application, "Messaging resumed").andExpect(status().isCreated());
        send(employer, application, "Welcome back").andExpect(status().isCreated());
        updateStatus(employer, job, application, "APPLIED").andExpect(jsonPath("$.chatEnabled").value(true));
        send(employer, application, "We can still discuss the role.").andExpect(status().isCreated());
        messages(employee, application).andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(4));
    }

    @Test
    void eachMessageNotifiesOnlyRecipientAndReadAcknowledgementsAreScopedAndBounded() throws Exception {
        String employer = register("EMPLOYER");
        String employee = register("EMPLOYEE");
        long job = createJob(employer);
        long application = apply(employee, job);
        updateStatus(employer, job, application, "REVIEWING");
        long first = body(send(employer, application, "First").andExpect(status().isCreated())).get("id").asLong();
        long second = body(send(employer, application, "Second").andExpect(status().isCreated())).get("id").asLong();
        notifications(employee).andExpect(jsonPath("$.unreadCount").value(3))
            .andExpect(jsonPath("$.items[0].targetPath").value("/employee/messages/" + application));
        notifications(employer).andExpect(jsonPath("$.unreadCount").value(1));

        // Reading up to an observed message must not consume later messages or status notifications.
        markRead(employee, application, first).andExpect(status().isNoContent());
        markRead(employee, application, first).andExpect(status().isNoContent());
        notifications(employee).andExpect(jsonPath("$.unreadCount").value(2));
        long third = body(send(employer, application, "Third").andExpect(status().isCreated())).get("id").asLong();
        markRead(employee, application, second).andExpect(status().isNoContent());
        notifications(employee).andExpect(jsonPath("$.unreadCount").value(2));
        markRead(employee, application, third).andExpect(status().isNoContent());
        notifications(employee).andExpect(jsonPath("$.unreadCount").value(1));
        long reply = body(send(employee, application, "Reply").andExpect(status().isCreated())).get("id").asLong();
        notifications(employer).andExpect(jsonPath("$.unreadCount").value(2))
            .andExpect(jsonPath("$.items[0].targetPath").value("/employer/messages/" + application));
        markRead(employee, application, reply).andExpect(status().isNoContent());
        notifications(employer).andExpect(jsonPath("$.unreadCount").value(2));
        markRead(employer, application, reply).andExpect(status().isNoContent());
        notifications(employer).andExpect(jsonPath("$.unreadCount").value(1));

        long otherJob = createJob(employer);
        long otherApplication = apply(employee, otherJob);
        updateStatus(employer, otherJob, otherApplication, "SHORTLISTED");
        long otherMessage = body(send(employer, otherApplication, "Other room")
            .andExpect(status().isCreated())).get("id").asLong();
        markRead(employee, application, otherMessage).andExpect(status().isBadRequest());
        markRead(employee, application, reply).andExpect(status().isNoContent());
        notifications(employee).andExpect(jsonPath("$.unreadCount").value(3));
    }

    @Test
    void closedJobsKeepChatsButDeletionCascadesMessagesAndNotifications() throws Exception {
        String employer = register("EMPLOYER");
        String employee = register("EMPLOYEE");
        long job = createJob(employer);
        long application = apply(employee, job);
        updateStatus(employer, job, application, "ACCEPTED");
        send(employee, application, "Before closing").andExpect(status().isCreated());
        mockMvc.perform(patch("/api/employer/jobs/{id}/status", job).header("Authorization", employer)
            .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"CLOSED\"}")).andExpect(status().isOk());
        chats(employee).andExpect(jsonPath("$[0].jobClosed").value(true));
        send(employer, application, "After closing").andExpect(status().isCreated());
        messages(employee, application).andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(2));
        updateStatus(employer, job, application, "REJECTED");
        chats(employee).andExpect(jsonPath("$[0].jobClosed").value(true))
            .andExpect(jsonPath("$[0].canSendMessages").value(false));
        send(employee, application, "Closed and rejected").andExpect(status().isBadRequest());
        send(employer, application, "Closed and rejected").andExpect(status().isBadRequest());
        messages(employee, application).andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(2));
        entityManager.flush();
        entityManager.clear();
        mockMvc.perform(delete("/api/employer/jobs/{id}", job).header("Authorization", employer))
            .andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();
        chats(employee).andExpect(jsonPath("$.length()").value(0));
        messages(employee, application).andExpect(status().isBadRequest());
        send(employee, application, "Deleted").andExpect(status().isBadRequest());
        notifications(employee).andExpect(jsonPath("$.items.length()").value(0));
        notifications(employer).andExpect(jsonPath("$.items.length()").value(0));
        assertEquals(0L, entityManager.createQuery(
            "select count(m) from ChatMessage m where m.applicationId = :id", Long.class)
            .setParameter("id", application).getSingleResult());
    }

    @Test
    void validatesMessagesAndPaginatesWithoutRepeatingOrLosingHistory() throws Exception {
        String employer = register("EMPLOYER");
        String employee = register("EMPLOYEE");
        long job = createJob(employer);
        long application = apply(employee, job);
        updateStatus(employer, job, application, "SHORTLISTED");
        for (String invalid : new String[] {"", " \n\t ", "x".repeat(5001)}) {
            send(employee, application, invalid).andExpect(status().isBadRequest());
        }
        mockMvc.perform(post("/api/chats/{id}/messages", application).header("Authorization", employee)
            .contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isBadRequest());
        messages(employee, application).andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(0));
        notifications(employer).andExpect(jsonPath("$.unreadCount").value(1));
        send(employee, application, "x".repeat(5000)).andExpect(status().isCreated())
            .andExpect(jsonPath("$.body").value("x".repeat(5000)));
        for (int i = 0; i < 50; i++) {
            send(employee, application, "Message " + i).andExpect(status().isCreated());
        }
        JsonNode page = body(messages(employee, application).andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(50)).andExpect(jsonPath("$.hasMore").value(true)));
        long cursor = page.get("items").get(49).get("id").asLong();
        for (int i = 1; i < 50; i++) {
            assertFalse(page.get("items").get(i - 1).get("id").asLong() <= page.get("items").get(i).get("id").asLong());
        }
        mockMvc.perform(get("/api/chats/{id}/messages", application).header("Authorization", employer)
            .param("beforeId", Long.toString(cursor))).andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(1)).andExpect(jsonPath("$.hasMore").value(false))
            .andExpect(jsonPath("$.items[0].body").value("x".repeat(5000)));
        mockMvc.perform(get("/api/chats/{id}/messages", application).header("Authorization", employee)
            .param("beforeId", "0")).andExpect(status().isBadRequest());
    }

    private String register(String role) throws Exception {
        String email = UUID.randomUUID() + "@example.com";
        String password = "TemporaryPass123!";
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
            {"email":"%s","password":"%s","role":"%s","displayName":"Chat Test",
             "fullName":"Chat Applicant","companyName":"Chat Company"}
            """.formatted(email, password, role))).andExpect(status().isOk());
        return "Bearer " + body(mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(java.util.Map.of("email", email, "password", password))))
            .andExpect(status().isOk())).get("token").asString();
    }

    private long createJob(String employer) throws Exception {
        return body(mockMvc.perform(post("/api/employer/jobs").header("Authorization", employer)
            .contentType(MediaType.APPLICATION_JSON).content("""
                {"title":"Chat Role","description":"Test role","employmentType":"FULL_TIME"}
                """)).andExpect(status().isCreated())).get("id").asLong();
    }

    private long apply(String employee, long job) throws Exception {
        return body(mockMvc.perform(post("/api/employee/jobs/{id}/applications", job)
            .header("Authorization", employee).contentType(MediaType.APPLICATION_JSON)
            .content("{\"coverLetter\":\"I am interested.\"}")).andExpect(status().isCreated())).get("id").asLong();
    }

    private ResultActions updateStatus(String employer, long job, long application, String value) throws Exception {
        return mockMvc.perform(patch("/api/employer/jobs/{job}/applications/{application}/status", job, application)
            .header("Authorization", employer).contentType(MediaType.APPLICATION_JSON)
            .content("{\"status\":\"" + value + "\"}")).andExpect(status().isOk());
    }

    private ResultActions chats(String auth) throws Exception {
        return mockMvc.perform(get("/api/chats").header("Authorization", auth)).andExpect(status().isOk());
    }

    private ResultActions messages(String auth, long application) throws Exception {
        return mockMvc.perform(get("/api/chats/{id}/messages", application).header("Authorization", auth));
    }

    private ResultActions send(String auth, long application, String body) throws Exception {
        return mockMvc.perform(post("/api/chats/{id}/messages", application).header("Authorization", auth)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(java.util.Map.of("body", body))));
    }

    private ResultActions markRead(String auth, long application, long throughMessage) throws Exception {
        return mockMvc.perform(patch("/api/chats/{id}/read", application).header("Authorization", auth)
            .param("throughMessageId", Long.toString(throughMessage)));
    }

    private ResultActions notifications(String auth) throws Exception {
        return mockMvc.perform(get("/api/notifications").header("Authorization", auth)).andExpect(status().isOk());
    }

    private JsonNode body(ResultActions result) throws Exception {
        return objectMapper.readTree(result.andReturn().getResponse().getContentAsString());
    }
}
