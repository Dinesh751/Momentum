package com.momentum.momentum_api.service;

import com.momentum.momentum_api.dto.auth.AuthResponse;
import com.momentum.momentum_api.dto.auth.LoginRequest;
import com.momentum.momentum_api.dto.auth.RegisterRequest;
import com.momentum.momentum_api.entity.RefreshToken;
import com.momentum.momentum_api.entity.Streak;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.exception.EmailAlreadyExistsException;
import com.momentum.momentum_api.exception.InvalidCredentialsException;
import com.momentum.momentum_api.repository.RefreshTokenRepository;
import com.momentum.momentum_api.repository.StreakRepository;
import com.momentum.momentum_api.repository.UserRepository;
import com.momentum.momentum_api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StreakRepository streakRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .build();

        userRepository.save(user);

        streakRepository.save(Streak.builder().user(user).build());

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken refreshToken = refreshTokenService.validate(rawRefreshToken);
        User user = refreshToken.getUser();

        refreshTokenService.revoke(rawRefreshToken);

        return buildAuthResponse(user);
    }

    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(InvalidCredentialsException::new);

        user.setDeletedAt(OffsetDateTime.now());
        userRepository.save(user);

        refreshTokenRepository.revokeAllByUser(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.create(user);
        return new AuthResponse(accessToken, refreshToken.getToken(), user.getEmail(), user.getDisplayName());
    }
}
