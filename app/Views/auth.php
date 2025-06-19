<?php

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - FerieSystem</title>
    <link rel="stylesheet" href="css/login.css">
    <script src="js/login.js" defer></script>
</head>
<body>
    <div class="login-form">
        <div class="container">
            <header>
                <h1 id="headerTitle">FerieSystem Login</h1>
            </header>

            <div class="content">
                <form action="/login" method="post">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="Email address" required>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="Password" required>
                    </div>

                    <div class="form-group">
                        <div class="forgot-password">
                            <label for="remember">
                                <input type="checkbox" id="remember" name="remember">
                                Remember me
                            </label>
                            <div>
                                <a href="/forgot-password">Forgot password?</a>
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

                <form id="registrationForm" style="display: none;">
                    <h2>Create Account</h2>
                    <p class="form-description">Fill in your details to register</p>
                    <div class="form-group">
                        <label for="registerName">Name</label>
                        <input type="text" id="registerName" name="name" placeholder="Full name" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email</label>
                        <input type="email" id="registerEmail" name="email" placeholder="Email address" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Password</label>
                        <input type="password" id="registerPassword" name="password" placeholder="Create password" required>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm password" required>
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
        <p>&copy; 2025 FerieSystem. All rights reserved.</p>
    </footer>
</body>
</html>
