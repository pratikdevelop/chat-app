package com.example.repository;

import com.example.model.ExpireMe;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpireMeRepository extends MongoRepository<ExpireMe, String> {
    ExpireMe findByUserIdAndOtp(String userId, String otp);
}