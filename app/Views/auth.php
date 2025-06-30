<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$error = $_SESSION['login_error'] ?? null;
$regError = $_SESSION['registration_error'] ?? $_SESSION['register_error'] ?? null;
$regSuccess = $_SESSION['registration_success'] ?? $_SESSION['success_message'] ?? null;

unset($_SESSION['login_error'], $_SESSION['registration_error'], $_SESSION['registration_success'], $_SESSION['register_error'], $_SESSION['success_message']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php require_once __DIR__ . '/components/header.php'; ?>
    <title>Login - FerieSystem</title>
    <link rel="stylesheet" href="public/css/login.css">
    <script>
        window.APP_URLS = {
            login: '<?= url('/api/login') ?>',
            register: '<?= url('/api/register') ?>',
            verifyKey: '<?= url('/api/verify-key') ?>',
            auth: '<?= url('/auth') ?>'
        };
    </script>
    <script src="public/js/login.js" defer></script>
</head>
<body>
    <div class="login-form">
        <div class="container">
            <header>
                <h1 id="headerTitle">FerieSystem Login</h1>
            </header>

            <div class="content">
                <?php if ($error): ?>
                    <div class="alert alert-error" style="background-color: #fee; border: 1px solid #fcc; color: #c66; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
                        <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>
                
                <?php if ($regError): ?>
                    <div class="alert alert-error" style="background-color: #fee; border: 1px solid #fcc; color: #c66; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
                        <?php echo htmlspecialchars($regError); ?>
                    </div>
                <?php endif; ?>
                
                <?php if ($regSuccess): ?>
                    <div class="alert alert-success" style="background-color: #efe; border: 1px solid #cfc; color: #6c6; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
                        <?php echo htmlspecialchars($regSuccess); ?>
                    </div>
                <?php endif; ?>
                
                <form action="<?= url('/login') ?>" method="post" id="loginForm">
                    <div class="form-group">
                        <label for="email">User</label>
                        <input type="text" id="email" name="email" placeholder="Email or username" required>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="password-input-container">
                            <input type="password" id="password" name="password" placeholder="Password" required>
                            <button type="button" class="password-toggle" data-target="password">
                                <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg class="eye-off-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="form-group">
                        <div class="forgot-password">
                            <label for="remember">
                                <input type="checkbox" id="remember" name="remember" value="1">
                                Remember me
                            </label>
                            <div onclick="alert('Construction in progress 🚧')">
                                <a>Forgot password?</a>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <button type="submit" class="btn">Sign In</button>
                    </div>

                    <div class="register-link">
                        Don't have an account? <a href="#" id="showRegisterKey">Register here</a>
                    </div>
                </form>

                <form id="keyVerificationForm" style="display: none;">
                    <h2>Registration Key</h2>
                    <p class="form-description">Please enter your registration key to continue</p>
                    <div class="form-group">
                        
                        <div class="key-input-container">
                            <input type="text" class="key-box" maxlength="1" id="key1" required>
                            <input type="text" class="key-box" maxlength="1" id="key2" required>
                            <input type="text" class="key-box" maxlength="1" id="key3" required>
                            <input type="text" class="key-box" maxlength="1" id="key4" required>
                            <input type="text" class="key-box" maxlength="1" id="key5" required>
                            <input type="text" class="key-box" maxlength="1" id="key6" required>
                            <input type="text" class="key-box" maxlength="1" id="key7" required>
                            <input type="text" class="key-box" maxlength="1" id="key8" required>
                        </div>
                        <input type="hidden" id="registrationKey" name="registrationKey">
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn">Continue</button>
                    </div>
                    <div class="register-link">
                        <a href="#" id="showLogin">← Back to Login</a>
                    </div>
                </form>

                <form action="<?= url('/register') ?>" method="post" id="registrationForm" style="display: none;">
                    <h2>Create Account</h2>
                    <p class="form-description">Fill in your details to register</p>
                    <input type="hidden" id="regRegistrationKey" name="registrationKey" value="">
                    <div class="form-group">
                        <label for="registerName">Name</label>
                        <input type="text" id="registerName" name="name" placeholder="Full name" required>
                    </div>
                    <div class="form-group">
                        <label for="registerUsername">Username</label>
                        <input type="text" id="registerUsername" name="username" placeholder="Choose a username" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email</label>
                        <input type="email" id="registerEmail" name="email" placeholder="Email address" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Password</label>
                        <div class="password-input-container">
                            <input type="password" id="registerPassword" name="password" placeholder="Create password" required>
                            <button type="button" class="password-toggle" data-target="registerPassword">
                                <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg class="eye-off-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <div class="password-input-container">
                            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm password" required>
                            <button type="button" class="password-toggle" data-target="confirmPassword">
                                <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg class="eye-off-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn">Create Account</button>
                    </div>
                    <div class="register-link">
                        <a href="#" id="showLoginFromRegister">← Back to Login</a>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <footer>
        <p>&copy; 2025 FerieSystem. All rights reserved. Developed by Thunderclaw Industries™</p>
    </footer>
</body>
</html>
