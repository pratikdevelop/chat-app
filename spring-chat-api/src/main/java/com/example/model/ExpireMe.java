package com.example.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "expireMe")
public class ExpireMe {
    @Id
    private String id;
    @Indexed(expireAfterSeconds = 360) // 6 minutes = 360 seconds
    private Date createdAt = new Date();
    private String userId;
    private String otp;
}