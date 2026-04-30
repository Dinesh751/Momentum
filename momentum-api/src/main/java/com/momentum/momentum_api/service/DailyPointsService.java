package com.momentum.momentum_api.service;

import com.momentum.momentum_api.dto.dailypoints.DailyPointsResponse;
import com.momentum.momentum_api.entity.DailyPoints;
import com.momentum.momentum_api.entity.Task;
import com.momentum.momentum_api.entity.User;
import com.momentum.momentum_api.exception.InvalidCredentialsException;
import com.momentum.momentum_api.repository.DailyPointsRepository;
import com.momentum.momentum_api.repository.StreakRepository;
import com.momentum.momentum_api.repository.TaskRepository;
import com.momentum.momentum_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DailyPointsService {

    private final DailyPointsRepository dailyPointsRepository;
    private final TaskRepository taskRepository;
    private final StreakRepository streakRepository;
    private final UserRepository userRepository;

    /**
     * Recalculates pointsEarned and totalPossiblePts for the given user/date from
     * the live task list. Called after any task operation that affects a due date.
     */
    @Transactional
    public void sync(User user, LocalDate date) {
        if (date == null) return;

        List<Task> tasks = taskRepository.findAllByUserAndDueDateAndSkippedFalseOrderByCreatedAtAsc(user, date);
        Optional<DailyPoints> existing = dailyPointsRepository.findByUserAndDate(user, date);

        if (tasks.isEmpty() && existing.isEmpty()) return;

        int totalPossible = tasks.stream().mapToInt(Task::getPoints).sum();
        int earned = tasks.stream().filter(Task::isCompleted).mapToInt(Task::getPoints).sum();
        int threshold = streakRepository.findByUser(user)
                .map(s -> s.getCurrentThreshold())
                .orElse(10);

        DailyPoints dp = existing.orElse(
                DailyPoints.builder().user(user).date(date).thresholdPts(threshold).build()
        );

        dp.setTotalPossiblePts(totalPossible);
        dp.setPointsEarned(earned);
        dp.setThresholdMet(earned >= dp.getThresholdPts());

        dailyPointsRepository.save(dp);
    }

    @Transactional(readOnly = true)
    public DailyPointsResponse getSummary(String email, LocalDate date) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(InvalidCredentialsException::new);

        DailyPoints dp = dailyPointsRepository.findByUserAndDate(user, date)
                .orElse(DailyPoints.builder()
                        .user(user)
                        .date(date)
                        .thresholdPts(streakRepository.findByUser(user)
                                .map(s -> s.getCurrentThreshold())
                                .orElse(10))
                        .build());

        return DailyPointsResponse.from(dp);
    }
}
