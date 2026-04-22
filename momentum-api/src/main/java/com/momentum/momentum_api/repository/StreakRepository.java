package com.momentum.momentum_api.repository;

import com.momentum.momentum_api.entity.Streak;
import com.momentum.momentum_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StreakRepository extends JpaRepository<Streak, Long> {

    Optional<Streak> findByUser(User user);
}
