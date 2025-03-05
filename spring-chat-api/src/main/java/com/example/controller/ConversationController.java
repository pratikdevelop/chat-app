package com.example.controller;

import com.example.model.Conversation;
import com.example.repository.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ConversationController {

    @Autowired
    private ConversationRepository conversationRepository;

    @GetMapping("/conversations/{memberId}")
    public ResponseEntity<?> getConversationsByMemberId(@PathVariable String memberId) {
        try {
            List<Conversation> conversations = conversationRepository.findByMembersContaining(memberId);
            return ResponseEntity.ok(new ResponseWrapper("conversations", conversations));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to retrieve conversations: " + e.getMessage()));
        }
    }

    @PostMapping("/conversation")
    public ResponseEntity<?> createConversation(@Valid @RequestBody ConversationRequest request) {
        try {
            Conversation conversation = new Conversation();
            conversation.setMembers(List.of(request.senderId(), request.receiverId()));
            Conversation saved = conversationRepository.save(conversation);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ResponseWrapper("conversation", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to create conversation: " + e.getMessage()));
        }
    }
}

// Helper classes for request/response
record ConversationRequest(String senderId, String receiverId) {}
record ResponseWrapper(String key, Object value) {}
record ErrorResponse(String error) {}