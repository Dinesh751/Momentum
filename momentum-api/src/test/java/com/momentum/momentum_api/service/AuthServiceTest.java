package com.momentum.momentum_api.service;

import com.momentum.momentum_api.dto.auth.AuthResponse;
import com.momentum.momentum_api.dto.auth.LoginRequest;
import com.momentum.momentum_api.dto.auth.RegisterRequest;
import com.momentum.momentum_api.entity.RefreshToken;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.exception.EmailAlreadyExistsException;
import com.momentum.momentum_api.exception.InvalidCredentialsException;
import com.momentum.momentum_api.repository.RefreshTokenRepository;
import com.momentum.momentum_api.repository.StreakRepository;
import com.momentum.momentum_api.repository.UserRepository;
import com.momentum.momentum_api.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private StreakRepository streakRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private RefreshTokenService refreshTokenService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User savedUser;
    private RefreshToken refreshToken;

    @BeforeEach
    void setUp() {
        savedUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .passwordHash("hashed")
                .displayName("Test User")
                .build();

        refreshToken = RefreshToken.builder()
                .user(savedUser)
                .token("refresh-uuid-token")
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .build();
    }

    // ── Register ──────────────────────────────────────────────────────────────

    @Test
    void register_success_createsUserAndStreakAndReturnsBothTokens() {
        RegisterRequest request = registerRequest();
        when(userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any())).thenReturn(savedUser);
        when(jwtUtil.generateToken(anyString())).thenReturn("access-token");
        when(refreshTokenService.create(any())).thenReturn(refreshToken);

        AuthResponse response = authService.register(request);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-uuid-token");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        verify(streakRepository).save(any());
    }

    @Test
    void register_throws_whenEmailAlreadyExists() {
        RegisterRequest request = registerRequest();
        when(userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class);

        verify(userRepository, never()).save(any());
        verify(streakRepository, never()).save(any());
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Test
    void login_success_returnsBothTokens() {
        LoginRequest request = loginRequest();
        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches(request.getPassword(), savedUser.getPasswordHash())).thenReturn(true);
        when(jwtUtil.generateToken(anyString())).thenReturn("access-token");
        when(refreshTokenService.create(any())).thenReturn(refreshToken);

        AuthResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-uuid-token");
    }

    @Test
    void login_throws_whenEmailNotFound() {
        LoginRequest request = loginRequest();
        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_throws_whenPasswordIsWrong() {
        LoginRequest request = loginRequest();
        when(userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches(request.getPassword(), savedUser.getPasswordHash())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    // ── Refresh ───────────────────────────────────────────────────────────────

    @Test
    void refresh_success_revokesOldAndIssuesNewTokenPair() {
        when(refreshTokenService.validate("old-refresh")).thenReturn(refreshToken);
        when(jwtUtil.generateToken(anyString())).thenReturn("new-access-token");
        when(refreshTokenService.create(savedUser)).thenReturn(
                RefreshToken.builder().token("new-refresh").user(savedUser)
                        .expiresAt(OffsetDateTime.now().plusDays(7)).build());

        AuthResponse response = authService.refresh("old-refresh");

        verify(refreshTokenService).revoke("old-refresh");
        assertThat(response.getAccessToken()).isEqualTo("new-access-token");
        assertThat(response.getRefreshToken()).isEqualTo("new-refresh");
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    @Test
    void logout_revokesRefreshToken() {
        authService.logout("some-refresh-token");

        verify(refreshTokenService).revoke("some-refresh-token");
    }

    // ── Delete account ────────────────────────────────────────────────────────

    @Test
    void deleteAccount_softDeletesUser_andRevokesAllTokens() {
        when(userRepository.findByEmailAndDeletedAtIsNull("test@example.com")).thenReturn(Optional.of(savedUser));
        when(userRepository.save(any())).thenReturn(savedUser);

        authService.deleteAccount("test@example.com");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getDeletedAt()).isNotNull();
        verify(refreshTokenRepository).revokeAllByUser(savedUser);
    }

    @Test
    void deleteAccount_throws_whenUserNotFound() {
        when(userRepository.findByEmailAndDeletedAtIsNull("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.deleteAccount("ghost@example.com"))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private RegisterRequest registerRequest() {
        RegisterRequest r = new RegisterRequest();
        r.setEmail("test@example.com");
        r.setPassword("password123");
        r.setDisplayName("Test User");
        return r;
    }

    private LoginRequest loginRequest() {
        LoginRequest r = new LoginRequest();
        r.setEmail("test@example.com");
        r.setPassword("password123");
        return r;
    }
}
