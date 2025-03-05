package com.example.repository;

import com.example.model.Users;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsersRepository extends MongoRepository<Users, String> {
    Users findByEmail(String email);
    Users findByUsername(String username);
}