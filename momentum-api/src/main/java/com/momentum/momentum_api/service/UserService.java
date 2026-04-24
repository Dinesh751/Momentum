package com.momentum.momentum_api.service;

import com.momentum.momentum_api.dto.user.ChangePasswordRequest;
import com.momentum.momentum_api.dto.user.UpdateProfileRequest;
import com.momentum.momentum_api.dto.user.UserProfileResponse;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.exception.InvalidCredentialsException;
import com.momentum.momentum_api.repository.RefreshTokenRepository;
import com.momentum.momentum_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        return UserProfileResponse.from(resolveUser(email));
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = resolveUser(email);

        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setDisplayName(request.getDisplayName().trim());
        }
        if (request.getTimezone() != null) {
            try {
                ZoneId.of(request.getTimezone());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid timezone: " + request.getTimezone());
            }
            user.setTimezone(request.getTimezone());
        }

        userRepository.save(user);
        return UserProfileResponse.from(user);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = resolveUser(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(String email) {
        User user = resolveUser(email);
        user.setDeletedAt(OffsetDateTime.now());
        userRepository.save(user);
        refreshTokenRepository.revokeAllByUser(user);
    }

    private User resolveUser(String email) {
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(InvalidCredentialsException::new);
    }
}
