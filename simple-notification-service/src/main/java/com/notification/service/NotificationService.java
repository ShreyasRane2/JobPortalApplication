package com.notification.service;

import com.notification.dto.NotificationRequest;
import com.notification.dto.NotificationResponse;
import com.notification.entity.Notification;
import com.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    public NotificationResponse createNotification(NotificationRequest request) {
        log.info("Creating notification for user: {}", request.getRecipientId());
        
        Notification notification = new Notification();
        notification.setRecipientId(request.getRecipientId());
        notification.setRecipientEmail(request.getRecipientEmail());
        notification.setNotificationType(request.getNotificationType());
        notification.setSubject(request.getSubject());
        notification.setMessage(request.getMessage());
        notification.setIsRead(false);
        
        Notification saved = notificationRepository.save(notification);
        log.info("Notification created with ID: {}", saved.getId());
        
        return convertToResponse(saved);
    }
    
    public List<NotificationResponse> getNotificationsByUserId(Long userId) {
        log.info("Fetching notifications for user: {}", userId);
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        log.info("Found {} notifications", notifications.size());
        return notifications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        log.info("Fetching unread notifications for user: {}", userId);
        return notificationRepository.findByRecipientIdAndIsReadOrderByCreatedAtDesc(userId, false)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsRead(userId, false);
    }
    
    public void markAsRead(Long notificationId) {
        log.info("Marking notification {} as read", notificationId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    public Notification createNotification(Notification notification) {
        log.info("Saving notification for user: {}", notification.getRecipientId());
        return notificationRepository.save(notification);
    }

    
    public void markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        List<Notification> notifications = notificationRepository.findByRecipientIdAndIsReadOrderByCreatedAtDesc(userId, false);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }
    
    private NotificationResponse convertToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setRecipientId(notification.getRecipientId());
        response.setRecipientEmail(notification.getRecipientEmail());
        response.setNotificationType(notification.getNotificationType());
        response.setSubject(notification.getSubject());
        response.setMessage(notification.getMessage());
        response.setIsRead(notification.getIsRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
