package com.example.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "Message")
public class Message {
    @Id
    private String id;
    private String conversationId;
    private String senderId;
    private String message;
    private String messageType = "text";
    private Date createdAt;
    private Date updatedAt;
}