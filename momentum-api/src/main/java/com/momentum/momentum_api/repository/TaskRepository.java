package com.momentum.momentum_api.repository;

import com.momentum.momentum_api.entity.Task;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.enums.TaskPriority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
}
