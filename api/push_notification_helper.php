<?php
// api/push_notification_helper.php

function sendPushNotification($pushToken, $title, $body, $data = [])
{
    $url = 'https://exp.host/--/api/v2/push/send';

    $payload = [
        'to' => $pushToken,
        'title' => $title,
        'body' => $body,
        'data' => $data,
        'sound' => 'default',
        'priority' => 'high',
        'channelId' => 'otp-channel'
    ];

    $headers = [
        'Accept: application/json',
        'Accept-encoding: gzip, deflate',
        'Content-Type: application/json',
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $response = json_decode($result, true);
        if (isset($response['data']) && $response['data']['status'] === 'ok') {
            return ['success' => true, 'message' => 'Push notification sent successfully'];
        } else {
            error_log("Push notification failed: " . $result);
            return ['success' => false, 'message' => 'Push notification delivery failed'];
        }
    } else {
        error_log("Push notification HTTP error: " . $httpCode . " - " . $result);
        return ['success' => false, 'message' => 'Push notification service error'];
    }
}

function sendOTPPushNotification($pushToken, $otp, $phoneNumber)
{
    $title = 'Church App - Verification Code';
    $body = "Your verification code is: $otp";
    $data = [
        'type' => 'otp',
        'otp' => $otp,
        'phone_number' => $phoneNumber
    ];

    return sendPushNotification($pushToken, $title, $body, $data);
}

function validatePushToken($token)
{
    // Basic validation for Expo push token format
    return preg_match('/^ExponentPushToken\[[a-zA-Z0-9_-]+\]$/', $token) ||
        preg_match('/^[a-zA-Z0-9_-]{22}$/', $token);
}
