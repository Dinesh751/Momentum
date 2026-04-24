package com.momentum.momentum_api.repository;

import com.momentum.momentum_api.entity.DailyPoints;
import com.momentum.momentum_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyPointsRepository extends JpaRepository<DailyPoints, Long> {

    Optional<DailyPoints> findByUserAndDate(User user, LocalDate date);

    List<DailyPoints> findAllByUserAndDateBetween(User user, LocalDate start, LocalDate end);

    List<DailyPoints> findAllByUser(User user);
}
