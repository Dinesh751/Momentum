package com.momentum.momentum_api.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    private static final String SECRET = "TW9tZW50dW1UZXN0U2VjcmV0S2V5Rm9ySldUVGVzdGluZw==";
    private static final long EXPIRATION = 900000L;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", EXPIRATION);
    }

    @Test
    void generateToken_returnsNonNullToken() {
        String token = jwtUtil.generateToken("test@example.com");
        assertThat(token).isNotNull().isNotEmpty();
    }

    @Test
    void extractEmail_returnsCorrectEmail() {
        String email = "test@example.com";
        String token = jwtUtil.generateToken(email);
        assertThat(jwtUtil.extractEmail(token)).isEqualTo(email);
    }

    @Test
    void isTokenValid_returnsTrue_whenTokenMatchesEmail() {
        String email = "test@example.com";
        String token = jwtUtil.generateToken(email);
        assertThat(jwtUtil.isTokenValid(token, email)).isTrue();
    }

    @Test
    void isTokenValid_returnsFalse_whenEmailMismatch() {
        String token = jwtUtil.generateToken("test@example.com");
        assertThat(jwtUtil.isTokenValid(token, "other@example.com")).isFalse();
    }

    @Test
    void isTokenValid_returnsFalse_whenTokenIsExpired() {
        ReflectionTestUtils.setField(jwtUtil, "expiration", -1000L);
        String token = jwtUtil.generateToken("test@example.com");
        assertThat(jwtUtil.isTokenValid(token, "test@example.com")).isFalse();
    }

    @Test
    void isTokenValid_returnsFalse_whenTokenIsMalformed() {
        assertThat(jwtUtil.isTokenValid("not.a.valid.token", "test@example.com")).isFalse();
    }
}
