package com.example.dcm;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.example.dcm.model.User;
import com.example.dcm.service.UserService;

import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class DcmApplication {

    public static void main(String[] args) {
        SpringApplication.run(DcmApplication.class, args);
    }

    @Bean
    public CommandLineRunner createDefaultUsers(UserService userService) {
        return args -> {
            // Create default admin user
            userService.createDefaultAdminIfNotExists();

            // Create sample District Court judge
            if (!userService.findByUsername("judge1").isPresent()) {
                User judge = new User("judge1", "judge123", "judge1@dcm.com", User.Role.JUDGE);
                judge.setFirstName("John");
                judge.setLastName("Smith");
                judge.setCourtLevel(User.CourtLevel.DISTRICT);
                userService.createUser(judge);
            }

            // Create High Court judge
            if (!userService.findByUsername("highcourt_judge").isPresent()) {
                User highCourtJudge = new User("highcourt_judge", "highcourt123", "highcourt@dcm.com", User.Role.JUDGE);
                highCourtJudge.setFirstName("Justice");
                highCourtJudge.setLastName("Rajendra Kumar");
                highCourtJudge.setCourtLevel(User.CourtLevel.HIGH);
                userService.createUser(highCourtJudge);
            }

            // Create Supreme Court judge
            if (!userService.findByUsername("supremecourt_judge").isPresent()) {
                User supremeCourtJudge = new User("supremecourt_judge", "supremecourt123", "supremecourt@dcm.com", User.Role.JUDGE);
                supremeCourtJudge.setFirstName("Chief Justice");
                supremeCourtJudge.setLastName("Arun Mishra");
                supremeCourtJudge.setCourtLevel(User.CourtLevel.SUPREME);
                userService.createUser(supremeCourtJudge);
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
