package com.momentum.momentum_api.repository;

import com.momentum.momentum_api.entity.Badge;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    List<UserBadge> findByUser(User user);

    boolean existsByUserAndBadge(User user, Badge badge);

    long countByUser(User user);
}
