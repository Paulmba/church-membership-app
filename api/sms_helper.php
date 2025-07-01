<?php
// api/sms_helper.php

function sendSMS($phone_number, $message)
{
    // For development/testing - just log the OTP and return true
    // Remove this in production
    error_log("SMS to $phone_number: $message");

    // Uncomment and configure one of the options below for production:

    // Option 1: Africa's Talking (popular in Africa)
    /*
    $username = 'your_username';
    $apiKey = 'your_api_key';
    $recipients = $phone_number;
    
    $gateway = new AfricasTalkingGateway($username, $apiKey);
    
    try {
        $results = $gateway->sendMessage($recipients, $message);
        return true;
    } catch (AfricasTalkingGatewayException $e) {
        error_log("SMS Error: " . $e->getMessage());
        return false;
    }
    */

    // Option 2: Twilio
    /*
    require_once 'vendor/autoload.php';
    use Twilio\Rest\Client;
    
    $account_sid = 'your_account_sid';
    $auth_token = 'your_auth_token';
    $twilio_number = 'your_twilio_number';
    
    $client = new Client($account_sid, $auth_token);
    
    try {
        $client->messages->create(
            $phone_number,
            [
                'from' => $twilio_number,
                'body' => $message
            ]
        );
        return true;
    } catch (Exception $e) {
        error_log("SMS Error: " . $e->getMessage());
        return false;
    }
    */

    // Option 3: Generic HTTP SMS API
    /*
    $api_url = 'https://your-sms-provider.com/api/send';
    $api_key = 'your_api_key';
    
    $data = [
        'phone' => $phone_number,
        'message' => $message,
        'api_key' => $api_key
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api_url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
    ]);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode === 200;
    */

    // For testing purposes - always return true
    // In production, replace this with actual SMS implementation
    return true;
}

// Function to validate phone number format
function validatePhoneNumber($phone_number)
{
    // Remove all non-numeric characters
    $phone = preg_replace('/[^0-9]/', '', $phone_number);

    // Check if it's a valid length (adjust based on your country)
    if (strlen($phone) >= 10 && strlen($phone) <= 15) {
        return true;
    }

    return false;
}

// Function to format phone number (adjust based on your country)
function formatPhoneNumber($phone_number)
{
    // Remove all non-numeric characters
    $phone = preg_replace('/[^0-9]/', '', $phone_number);

    // Add country code if missing (example for Zambia +260)
    if (strlen($phone) === 9 && !str_starts_with($phone, '260')) {
        $phone = '260' . $phone;
    }

    // Add + prefix if missing
    if (!str_starts_with($phone, '+')) {
        $phone = '+' . $phone;
    }

    return $phone;
}
