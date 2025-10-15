<?php
// middleware/JWTMiddleware.php - Issue 9: Token-based authorization

require_once __DIR__ . '/../api/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTMiddleware
{
    private $secret_key;

    public function __construct()
    {
        $this->secret_key = getenv('JWT_SECRET_KEY') ?: "197b7ca74482c4000c46ae8a88d5fe111cefe05e4f4c01407c82216c189b2955";
    }

    /**
     * Verify JWT token and return decoded payload
     */
    public function verifyToken($token)
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret_key, 'HS256'));
            return [
                'success' => true,
                'data' => (array)$decoded,
                'member_id' => $decoded->mid,
                'roles' => $decoded->roles ?? [],
                'isLeader' => $decoded->isLeader ?? false,
                'isPastor' => $decoded->isPastor ?? false
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Invalid or expired token',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get token from Authorization header
     */
    public function getTokenFromHeader()
    {
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { //Nginx or fast CGI
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('getallheaders')) {
            $requestHeaders = getallheaders();
            // Server-side fix for bug in old Android versions (a nice side-effect of this fix means we don't care about capitalization for Authorization)
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Middleware function to authenticate requests
     */
    public function authenticate($requireAuth = true)
    {
        $token = $this->getTokenFromHeader();

        if (!$token) {
            if ($requireAuth) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Authorization token required']);
                exit();
            }
            return ['success' => false, 'message' => 'No token provided'];
        }

        $verification = $this->verifyToken($token);

        if (!$verification['success']) {
            if ($requireAuth) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => $verification['message']]);
                exit();
            }
            return $verification;
        }

        return $verification;
    }

    /**
     * Check if user has required role
     */
    public function hasRole($userRoles, $requiredRole)
    {
        return in_array($requiredRole, $userRoles);
    }

    /**
     * Check if user has any of the required roles
     */
    public function hasAnyRole($userRoles, $requiredRoles)
    {
        return !empty(array_intersect($userRoles, $requiredRoles));
    }

    /**
     * Role-based authorization middleware
     */
    public function authorize($requiredRoles = [], $requireLeader = false, $requirePastor = false)
    {
        $auth = $this->authenticate(true);

        if (!$auth['success']) {
            return $auth;
        }

        $userRoles = $auth['roles'];
        $isLeader = $auth['isLeader'];
        $isPastor = $auth['isPastor'];

        // Check specific role requirements
        if (!empty($requiredRoles)) {
            if (!$this->hasAnyRole($userRoles, $requiredRoles)) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Insufficient permissions. Required roles: ' . implode(', ', $requiredRoles)
                ]);
                exit();
            }
        }

        // Check leader requirement
        if ($requireLeader && !$isLeader) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Leadership privileges required'
            ]);
            exit();
        }

        // Check pastor requirement
        if ($requirePastor && !$isPastor) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Pastor privileges required'
            ]);
            exit();
        }

        return $auth;
    }

    /**
     * Get current authenticated user info
     */
    public function getCurrentUser()
    {
        $auth = $this->authenticate(false);
        return $auth['success'] ? $auth : null;
    }
}

// Convenience functions for common authorization patterns
function requireAuth()
{
    $jwt = new JWTMiddleware();
    return $jwt->authenticate(true);
}

function requireLeader()
{
    $jwt = new JWTMiddleware();
    return $jwt->authorize([], true, false);
}

function requirePastor()
{
    $jwt = new JWTMiddleware();
    return $jwt->authorize([], false, true);
}

function requireRole($roles)
{
    $jwt = new JWTMiddleware();
    return $jwt->authorize($roles);
}

function requireAnyRole($roles)
{
    $jwt = new JWTMiddleware();
    return $jwt->authorize($roles);
}

// Example usage in API endpoints:
/*
// Protect endpoint for authenticated users only
$auth = requireAuth();
$memberId = $auth['member_id'];

// Protect endpoint for leaders only  
$auth = requireLeader();

// Protect endpoint for specific roles
$auth = requireRole(['Pastor', 'Elder']);

// Protect endpoint for pastors only
$auth = requirePastor();
*/
