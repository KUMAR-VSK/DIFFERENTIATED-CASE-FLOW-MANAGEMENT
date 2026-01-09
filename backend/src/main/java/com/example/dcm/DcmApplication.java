package com.example.dcm;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.example.dcm.model.User;
import com.example.dcm.service.UserService;

@SpringBootApplication
public class DcmApplication {

    public static void main(String[] args) {
        SpringApplication.run(DcmApplication.class, args);
    }

    @Bean
    public CommandLineRunner createDefaultUsers(UserService userService) {
        return args -> {
            // Create default admin user
            userService.createDefaultAdminIfNotExists();

            // Create sample judge
            if (!userService.findByUsername("judge1").isPresent()) {
                User judge = new User("judge1", "judge123", "judge1@dcm.com", User.Role.JUDGE);
                judge.setFirstName("John");
                judge.setLastName("Smith");
                userService.createUser(judge);
            }

            // Create sample clerk
            if (!userService.findByUsername("clerk1").isPresent()) {
                User clerk = new User("clerk1", "clerk123", "clerk1@dcm.com", User.Role.CLERK);
                clerk.setFirstName("Jane");
                clerk.setLastName("Doe");
                userService.createUser(clerk);
            }
        };
    }
}
