package com.example.dcm.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dcm.model.User;
import com.example.dcm.repository.UserRepository;

@Service
@Transactional
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    // Create new user
    public User createUser(User user) {
        // Validate uniqueness
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    // Find user by username
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Find user by ID
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // Get all users (admin only)
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Create default admin user (for initial setup)
    public void createDefaultAdminIfNotExists() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin123", "admin@dcm.com", User.Role.ADMIN);
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            createUser(admin);
        }
    }

    // Update user
    public User updateUser(Long id, User userDetails) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // Update fields
        if (userDetails.getFirstName() != null) {
            existingUser.setFirstName(userDetails.getFirstName());
        }
        if (userDetails.getLastName() != null) {
            existingUser.setLastName(userDetails.getLastName());
        }
        if (userDetails.getEmail() != null) {
            // Check email uniqueness if changed
            if (!existingUser.getEmail().equals(userDetails.getEmail()) && 
                userRepository.existsByEmail(userDetails.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }
            existingUser.setEmail(userDetails.getEmail());
        }
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        if (userDetails.getRole() != null) {
            existingUser.setRole(userDetails.getRole());
        }

        return userRepository.save(existingUser);
    }

    // Update user role
    public User updateUserRole(Long id, User.Role role) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        existingUser.setRole(role);
        return userRepository.save(existingUser);
    }

    // Update user court level (for judges only)
    public User updateUserCourtLevel(Long id, User.CourtLevel courtLevel) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (existingUser.getRole() != User.Role.JUDGE) {
            throw new IllegalArgumentException("Court level can only be set for judges");
        }

        existingUser.setCourtLevel(courtLevel);
        return userRepository.save(existingUser);
    }

    // Create judge with court level
    public User createJudge(String username, String password, String email, String firstName, String lastName, User.CourtLevel courtLevel) {
        // Validate uniqueness
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        User judge = new User(username, passwordEncoder.encode(password), email, User.Role.JUDGE);
        judge.setFirstName(firstName);
        judge.setLastName(lastName);
        judge.setCourtLevel(courtLevel);

        return userRepository.save(judge);
    }

    // Delete user
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}
