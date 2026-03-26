package com.webdatlichkhambenh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

import io.github.cdimascio.dotenv.Dotenv;
import java.nio.file.Files;
import java.nio.file.Paths;

@SpringBootApplication
@EnableScheduling
public class Main {
    public static void main(String[] args) {
        // Find .env file depending on working directory (VS Code parent dir vs Maven submodule dir)
        String envDir = Files.exists(Paths.get("./webdatlichkhambenh/.env")) ? "./webdatlichkhambenh/" : "./";
        
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory(envDir)
                    .ignoreIfMissing()
                    .load();
            dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));
        } catch (Exception e) {
            System.out.println("Warning: Failed to load .env file manually.");
        }

        SpringApplication.run(Main.class, args);
    }
}
