package com.webdatlichkhambenh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication // Đây chính là cái "đánh dấu" mà bạn cần
public class Main {
    public static void main(String[] args) {
        loadDotenvProperties();

        SpringApplication.run(Main.class, args);
    }

    private static void loadDotenvProperties() {
        List<Path> candidates = List.of(
                Paths.get(".env"),
                Paths.get("webdatlichkhambenh", ".env"));

        for (Path candidate : candidates) {
            Path absolutePath = candidate.toAbsolutePath().normalize();
            if (!Files.exists(absolutePath)) {
                continue;
            }

            try {
                for (String line : Files.readAllLines(absolutePath)) {
                    String trimmedLine = line.trim();
                    if (trimmedLine.isEmpty() || trimmedLine.startsWith("#") || !trimmedLine.contains("=")) {
                        continue;
                    }

                    int separatorIndex = trimmedLine.indexOf('=');
                    String key = trimmedLine.substring(0, separatorIndex).trim();
                    String value = trimmedLine.substring(separatorIndex + 1).trim();

                    if (!key.isEmpty() && System.getProperty(key) == null) {
                        System.setProperty(key, value);
                    }
                }
                return;
            } catch (Exception exception) {
                System.out.println("Warning: Failed to load .env file from " + absolutePath);
            }
        }
    }
}
