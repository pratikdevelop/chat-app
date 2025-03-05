package com.example.springchatapi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Data
@Document(collection = "Users")
public class Users {
    @Id
    private String id;
    @NotBlank
    private String name;
    @Email
    @Indexed(unique = true)
    private String email;
    @NotBlank
    @Indexed(unique = true)
    private String username;
    @NotBlank
    private String password;
    private String profileImage;
    private String status = "offline";

    // Password hashing before saving (equivalent to Mongoose pre-save)
    public void setPassword(String password) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        this.password = encoder.encode(password);
    }
}