package com.webdatlichkhambenh.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "chat.hours")
public class ChatOperatingHours {

    private Map<String, TimeRange> schedule = new HashMap<>();

    public ChatOperatingHours() {
        // Default schedule: 8:00 - 20:00 for all days
        for (DayOfWeek day : DayOfWeek.values()) {
            schedule.put(day.name().toLowerCase(), new TimeRange("08:00", "20:00"));
        }
    }

    public boolean isOperating() {
        LocalDateTime now = LocalDateTime.now();
        DayOfWeek today = now.getDayOfWeek();
        TimeRange range = schedule.get(today.name().toLowerCase());

        if (range == null) {
            return false; // No schedule = closed
        }

        LocalTime currentTime = now.toLocalTime();
        return !currentTime.isBefore(range.getStart()) && !currentTime.isAfter(range.getEnd());
    }

    public String getOperatingHoursMessage() {
        StringBuilder message = new StringBuilder("Chat trực tiếp hoạt động:\n");

        for (DayOfWeek day : DayOfWeek.values()) {
            TimeRange range = schedule.get(day.name().toLowerCase());
            if (range != null) {
                message.append(getDayName(day))
                        .append(": ")
                        .append(range.getStart())
                        .append(" - ")
                        .append(range.getEnd())
                        .append("\n");
            }
        }

        return message.toString();
    }

    private String getDayName(DayOfWeek day) {
        switch (day) {
            case MONDAY:
                return "Thứ 2";
            case TUESDAY:
                return "Thứ 3";
            case WEDNESDAY:
                return "Thứ 4";
            case THURSDAY:
                return "Thứ 5";
            case FRIDAY:
                return "Thứ 6";
            case SATURDAY:
                return "Thứ 7";
            case SUNDAY:
                return "Chủ nhật";
            default:
                return day.name();
        }
    }

    public Map<String, TimeRange> getSchedule() {
        return schedule;
    }

    public void setSchedule(Map<String, TimeRange> schedule) {
        this.schedule = schedule;
    }

    public static class TimeRange {
        private LocalTime start;
        private LocalTime end;

        public TimeRange() {
        }

        public TimeRange(String start, String end) {
            this.start = LocalTime.parse(start);
            this.end = LocalTime.parse(end);
        }

        public LocalTime getStart() {
            return start;
        }

        public void setStart(String start) {
            this.start = LocalTime.parse(start);
        }

        public LocalTime getEnd() {
            return end;
        }

        public void setEnd(String end) {
            this.end = LocalTime.parse(end);
        }
    }
}
