package com.momentum.momentum_api.repository;

import com.momentum.momentum_api.entity.Task;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.enums.TaskPriority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByUserAndDueDateOrderByCreatedAtAsc(User user, LocalDate dueDate);

    List<Task> findAllByUserAndDueDateBeforeAndCompletedFalseOrderByDueDateAscCreatedAtAsc(User user, LocalDate before);

    List<Task> findAllByUserAndDueDateGreaterThanEqualAndDueDateBeforeAndCompletedFalseOrderByDueDateAscCreatedAtAsc(User user, LocalDate after, LocalDate before);

    Optional<Task> findByIdAndUser(Long id, User user);

    List<Task> findAllByUserAndCompletedTrue(User user);

    long countByUserAndCompletedTrue(User user);

    long countByUserAndDueDate(User user, LocalDate dueDate);

    long countByUserAndDueDateAndCompletedFalse(User user, LocalDate dueDate);

    long countByUserAndDueDateAndPriorityAndCompletedTrue(User user, LocalDate dueDate, TaskPriority priority);

    long countByUser(User user);

    long countByUserAndPriorityAndCompletedTrue(User user, TaskPriority priority);

    List<Task> findAllByRecurringGroupIdOrderByDueDateAsc(UUID recurringGroupId);

    List<Task> findAllByRecurringGroupIdAndDueDateGreaterThanEqualOrderByDueDateAsc(UUID recurringGroupId, LocalDate from);

    Optional<Task> findFirstByRecurringGroupIdOrderByDueDateAsc(UUID recurringGroupId);

    Optional<Task> findFirstByRecurringGroupIdOrderByDueDateDesc(UUID recurringGroupId);

    long countByRecurringGroupId(UUID recurringGroupId);

    long countByRecurringGroupIdAndCompletedTrue(UUID recurringGroupId);

    List<Task> findAllByUserAndDueDateIsNullOrderByCreatedAtDesc(User user);

    boolean existsByRecurringGroupIdAndDueDate(UUID recurringGroupId, LocalDate dueDate);
}
