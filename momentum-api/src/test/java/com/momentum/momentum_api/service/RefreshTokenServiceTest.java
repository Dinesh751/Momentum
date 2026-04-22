package com.momentum.momentum_api.service;

import com.momentum.momentum_api.entity.RefreshToken;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.exception.InvalidRefreshTokenException;
import com.momentum.momentum_api.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User user;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenExpiration", 604800000L);
        user = User.builder().id(1L).email("test@example.com").displayName("Test").build();
    }

    @Test
    void create_revokesExistingTokens_andSavesNewToken() {
        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        RefreshToken result = refreshTokenService.create(user);

        verify(refreshTokenRepository).revokeAllByUser(user);
        verify(refreshTokenRepository).save(captor.capture());
        assertThat(result.getToken()).isNotNull();
        assertThat(result.getUser()).isEqualTo(user);
        assertThat(result.isRevoked()).isFalse();
        assertThat(result.getExpiresAt()).isAfter(OffsetDateTime.now());
    }

    @Test
    void validate_returnsToken_whenValid() {
        RefreshToken token = buildActiveToken();
        when(refreshTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));

        RefreshToken result = refreshTokenService.validate("valid-token");

        assertThat(result).isEqualTo(token);
    }

    @Test
    void validate_throws_whenTokenNotFound() {
        when(refreshTokenRepository.findByToken("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> refreshTokenService.validate("missing"))
                .isInstanceOf(InvalidRefreshTokenException.class);
    }

    @Test
    void validate_throws_whenTokenIsRevoked() {
        RefreshToken token = buildActiveToken();
        token.setRevoked(true);
        when(refreshTokenRepository.findByToken("revoked")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> refreshTokenService.validate("revoked"))
                .isInstanceOf(InvalidRefreshTokenException.class);
    }

    @Test
    void validate_throws_whenTokenIsExpired() {
        RefreshToken token = buildActiveToken();
        token.setExpiresAt(OffsetDateTime.now().minusHours(1));
        when(refreshTokenRepository.findByToken("expired")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> refreshTokenService.validate("expired"))
                .isInstanceOf(InvalidRefreshTokenException.class);
    }

    @Test
    void revoke_marksTokenAsRevoked() {
        RefreshToken token = buildActiveToken();
        when(refreshTokenRepository.findByToken("some-token")).thenReturn(Optional.of(token));
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        refreshTokenService.revoke("some-token");

        assertThat(token.isRevoked()).isTrue();
        verify(refreshTokenRepository).save(token);
    }

    @Test
    void revoke_doesNothing_whenTokenNotFound() {
        when(refreshTokenRepository.findByToken("unknown")).thenReturn(Optional.empty());

        refreshTokenService.revoke("unknown");

        verify(refreshTokenRepository, never()).save(any());
    }

    private RefreshToken buildActiveToken() {
        return RefreshToken.builder()
                .user(user)
                .token("valid-token")
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .revoked(false)
                .build();
    }
}
