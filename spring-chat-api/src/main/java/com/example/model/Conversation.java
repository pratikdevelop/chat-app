package com.example.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Document(collection = "Conversation")
public class Conversation {
    @Id
    private String id;
    private List<String> members;
    private Date createdAt;
    private Date updatedAt;
}