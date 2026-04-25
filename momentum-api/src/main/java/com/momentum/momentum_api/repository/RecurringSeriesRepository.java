package com.momentum.momentum_api.repository;

import com.momentum.momentum_api.entity.RecurringSeries;
import com.momentum.momentum_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecurringSeriesRepository extends JpaRepository<RecurringSeries, Long> {

    Optional<RecurringSeries> findByGroupId(UUID groupId);

    void deleteByGroupId(UUID groupId);

    // Series active on a specific date for a specific user (startDate <= date <= endDate)
    @Query("SELECT s FROM RecurringSeries s WHERE s.user = :user AND s.startDate <= :date AND s.endDate >= :date")
    List<RecurringSeries> findActiveSeriesForUserOnDate(@Param("user") User user, @Param("date") LocalDate date);

    // Same but across all users — used by the midnight streak scheduler
    @Query("SELECT s FROM RecurringSeries s WHERE s.startDate <= :date AND s.endDate >= :date")
    List<RecurringSeries> findAllActiveOnDate(@Param("date") LocalDate date);
}
