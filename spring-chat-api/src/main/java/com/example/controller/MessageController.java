package com.example.controller;

import com.example.model.Message;
import com.example.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

// Custom response classes defined as records
record ResponseWrapper(String key, Object value) {}
record ErrorResponse(String error) {}

@RestController
@RequestMapping("/api")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @GetMapping("/messages/{id}")
    public ResponseEntity<?> getMessageById(@PathVariable String id) {
        try {
            List<Message> messages = messageRepository.findByConversationId(id);
            return ResponseEntity.ok(new ResponseWrapper("messages", messages));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to retrieve messages: " + e.getMessage()));
        }
    }

    @PostMapping("/message")
    public ResponseEntity<?> postMessage(@RequestBody MessageRequest request) {
        try {
            Message message = new Message();
            message.setConversationId(request.conversationId());
            message.setSenderId(request.senderId());
            message.setMessage(request.message());
            Message saved = messageRepository.save(message);
            return ResponseEntity.ok(new ResponseWrapper("data", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to save message: " + e.getMessage()));
        }
    }

    @PostMapping("/message/file")
    public ResponseEntity<?> postFileData(@RequestParam("file") MultipartFile file,
                                          @RequestParam("conversationId") String conversationId,
                                          @RequestParam("senderId") String senderId) {
        try {
            // Determine subdirectory based on content type
            String contentType = file.getContentType();
            if (contentType == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("File content type is missing"));
            }
            String subDir = contentType.contains("image") ? "images" :
                            contentType.contains("video") ? "video" : "audio";
            Path uploadPath = Paths.get("public", subDir);
            Files.createDirectories(uploadPath); // Ensure directory exists
            Path filePath = uploadPath.resolve(System.currentTimeMillis() + "_" + file.getOriginalFilename());
            Files.write(filePath, file.getBytes());

            // Create and save message
            Message message = new Message();
            message.setConversationId(conversationId);
            message.setSenderId(senderId);
            message.setMessage(filePath.toString());
            message.setMessageType(contentType);
            Message saved = messageRepository.save(message);
            return ResponseEntity.ok(new ResponseWrapper("data", saved));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("File upload failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to save file message: " + e.getMessage()));
        }
    }
}

record MessageRequest(String conversationId, String senderId, String message) {}