<?php
namespace App\Controllers;

class NotificationController {
    private $notificationService;
    
    public function __construct() {
        require_once dirname(__DIR__) . '/Services/NotificationService.php';
        $this->notificationService = new \App\Services\NotificationService();
    }

    /**
     * Get notification counts for the current user
     */
    public function getNotificationCounts() {
        return $this->notificationService->getNotificationCountsAPI();
    }
}
