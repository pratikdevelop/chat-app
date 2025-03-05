package com.example.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String name, String otp) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("Password Reset Request");
        helper.setText(
                "<h1>Hello " + name + ",</h1>" +
                "<p>We received a request to reset your password. " +
                "Here is your OTP: <b>" + otp + "</b>. It is valid for 6 minutes.<br/>" +
                "If you didn’t request this, ignore this email.</p>",
                true);
        mailSender.send(message);
    }
}