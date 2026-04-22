package com.momentum.momentum_api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentum.momentum_api.dto.auth.AuthResponse;
import com.momentum.momentum_api.exception.EmailAlreadyExistsException;
import com.momentum.momentum_api.exception.InvalidCredentialsException;
import com.momentum.momentum_api.exception.InvalidRefreshTokenException;
import com.momentum.momentum_api.security.CustomUserDetailsService;
import com.momentum.momentum_api.security.JwtUtil;
import com.momentum.momentum_api.security.SecurityConfig;
import com.momentum.momentum_api.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean private AuthService authService;
    @MockitoBean private JwtUtil jwtUtil;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;

    private static final String BASE = "/api/v1/auth";

    // ── Register ──────────────────────────────────────────────────────────────

    @Test
    void register_returns201_whenRequestIsValid() throws Exception {
        when(authService.register(any())).thenReturn(authResponse());

        mockMvc.perform(post(BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerBody())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"));
    }

    @Test
    void register_returns400_whenRequestBodyIsInvalid() throws Exception {
        Map<String, String> body = Map.of("email", "not-an-email", "password", "short", "displayName", "");

        mockMvc.perform(post(BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        verifyNoInteractions(authService);
    }

    @Test
    void register_returns409_whenEmailAlreadyExists() throws Exception {
        when(authService.register(any())).thenThrow(new EmailAlreadyExistsException("Email already exists"));

        mockMvc.perform(post(BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerBody())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Test
    void login_returns200_whenCredentialsAreValid() throws Exception {
        when(authService.login(any())).thenReturn(authResponse());

        mockMvc.perform(post(BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginBody())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"));
    }

    @Test
    void login_returns401_whenCredentialsAreInvalid() throws Exception {
        when(authService.login(any())).thenThrow(new InvalidCredentialsException());

        mockMvc.perform(post(BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginBody())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ── Refresh ───────────────────────────────────────────────────────────────

    @Test
    void refresh_returns200_whenTokenIsValid() throws Exception {
        when(authService.refresh(any())).thenReturn(authResponse());

        mockMvc.perform(post(BASE + "/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\": \"some-refresh-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"));
    }

    @Test
    void refresh_returns401_whenTokenIsInvalid() throws Exception {
        when(authService.refresh(any())).thenThrow(new InvalidRefreshTokenException());

        mockMvc.perform(post(BASE + "/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\": \"bad-token\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    @Test
    void logout_returns200_andRevokesToken() throws Exception {
        mockMvc.perform(post(BASE + "/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\": \"some-refresh-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(authService).logout("some-refresh-token");
    }

    // ── Delete account ────────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "test@example.com")
    void deleteAccount_returns200_whenAuthenticated() throws Exception {
        mockMvc.perform(delete(BASE + "/account"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(authService).deleteAccount("test@example.com");
    }

    @Test
    void deleteAccount_returns401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(delete(BASE + "/account"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(authService);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private AuthResponse authResponse() {
        return new AuthResponse("access-token", "refresh-token", "test@example.com", "Test User");
    }

    private Map<String, String> registerBody() {
        return Map.of(
                "email", "test@example.com",
                "password", "password123",
                "displayName", "Test User"
        );
    }

    private Map<String, String> loginBody() {
        return Map.of(
                "email", "test@example.com",
                "password", "password123"
        );
    }
}
