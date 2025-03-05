package com.example.controller;

import com.example.model.Users;
import com.example.config.JwtUtil;
import com.example.model.ExpireMe;
import com.example.repository.UsersRepository;
import com.example.repository.ExpireMeRepository;
import com.example.service.EmailService;
import com.example.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private ExpireMeRepository expireMeRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @GetMapping("/")
    public String index() {
        return "home";
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody UserRequest request) {
        try {
            if (!request.password().equals(request.confirmPassword())) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Password and confirm password do not match"));
            }
            if (usersRepository.findByEmail(request.email()) != null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Email already exists"));
            }
            Users user = new Users();
            user.setName(request.name());
            user.setEmail(request.email());
            user.setUsername(request.username());
            user.setPassword(passwordEncoder.encode(request.password()));
            Users saved = usersRepository.save(user);
            return ResponseEntity.ok(new ResponseWrapper("response", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        try {
            List<Users> users = usersRepository.findAll();
            return ResponseEntity.ok(new ResponseWrapper("users", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Users user = usersRepository.findByEmail(request.email());
            if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid email or password"));
            }
            String token = JwtUtil.generateToken(user.getId());
            return ResponseEntity.ok(new LoginResponse("login successfully", token, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> forgetPassword(@RequestBody EmailRequest request) {
        try {
            Users user = usersRepository.findByEmail(request.email());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Email not found"));
            }
            String otp = otpService.generateOtp();
            ExpireMe expire = new ExpireMe();
            expire.setUserId(user.getId());
            expire.setOtp(otp);
            expireMeRepository.save(expire);
            emailService.sendOtpEmail(user.getEmail(), user.getName(), otp);
            return ResponseEntity.ok(new SuccessResponse("OTP sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpRequest request) {
        try {
            Users user = usersRepository.findByEmail(request.email());
            if (user == null || expireMeRepository.findByUserIdAndOtp(user.getId(), request.otp()) == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid or expired OTP"));
            }
            String token = JwtUtil.generateToken(user.getId());
            return ResponseEntity.ok(new ResponseWrapper("userId", user.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        try {
            Optional<Users> userOpt = usersRepository.findById(id);
            if (userOpt.isPresent()) {
                return ResponseEntity.ok(userOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            Optional<Users> userOpt = usersRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("User not found"));
            }
            Users user = userOpt.get();
            Path path = Paths.get("public/images", System.currentTimeMillis() + "_" + file.getOriginalFilename());
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());
            user.setProfileImage(path.toString());
            Users updated = usersRepository.save(user);
            return ResponseEntity.ok(new ResponseWrapper("data", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/change-password/{id}")
    public ResponseEntity<?> changePassword(@PathVariable String id, @RequestBody PasswordRequest request) {
        try {
            if (!request.password().equals(request.confirmPassword())) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Password and confirm password do not match"));
            }
            Optional<Users> userOpt = usersRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("User not found"));
            }
            Users user = userOpt.get();
            user.setPassword(passwordEncoder.encode(request.password()));
            Users updated = usersRepository.save(user);
            return ResponseEntity.ok(new ResponseWrapper("data", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(e.getMessage()));
        }
    }
}

record UserRequest(String name, String email, String username, String password, String confirmPassword) {}
record LoginRequest(String email, String password) {}
record LoginResponse(String message, String token, String userId) {}
record EmailRequest(String email) {}
record OtpRequest(String email, String otp) {}
record PasswordRequest(String password, String confirmPassword) {}
record SuccessResponse(String message) {}
record ResponseWrapper(String key, Object value) {}
record ErrorResponse(String error) {}