package com.momentum.momentum_api.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.DayOfWeek;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Stores a Set<DayOfWeek> as a comma-separated string in the DB column,
 * e.g. "MONDAY,WEDNESDAY,FRIDAY".
 */
@Converter
public class DayOfWeekSetConverter implements AttributeConverter<Set<DayOfWeek>, String> {

    @Override
    public String convertToDatabaseColumn(Set<DayOfWeek> attribute) {
        if (attribute == null || attribute.isEmpty()) return null;
        return attribute.stream()
                .map(DayOfWeek::name)
                .collect(Collectors.joining(","));
    }

    @Override
    public Set<DayOfWeek> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return new LinkedHashSet<>();
        return Arrays.stream(dbData.split(","))
                .map(String::trim)
                .map(DayOfWeek::valueOf)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
