<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['verified_admin_key'])) {
    $_SESSION['error_message'] = 'Access denied. Please verify admin key first.';
    header('Location: ' . url('/auth'));
    exit;
}

unset($_SESSION['error_message']);

$error = $_SESSION['error_message'] ?? null;
$success = $_SESSION['success_message'] ?? null;

unset($_SESSION['error_message'], $_SESSION['success_message']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?php require_once __DIR__ . '/components/header.php'; ?>
    <title>Create Super User - FerieSystem</title>
    <link rel="stylesheet" href="public/css/login.css">
    <script>
        window.APP_URLS = {
            createSuperUser: '<?= url('/api/create-superuser') ?>',
            auth: '<?= url('/auth') ?>'
        };
        console.log('APP_URLS:', window.APP_URLS);
    </script>
</head>
<body>
    <div class="login-form">
        <div class="container">
            <header style="text-align: center;">
                <h1 id="headerTitle">FerieSystem Registration</h1>
            </header>

            <div class="content">
                <?php if ($error): ?>
                    <div class="alert alert-error" style="background-color: #fee; border: 1px solid #fcc; color: #c66; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
                        <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>
                
                <?php if ($success): ?>
                    <div class="alert alert-success">
                        <?php echo htmlspecialchars($success); ?>
                    </div>
                <?php endif; ?>

                <form action="<?= url('/api/create-superuser') ?>" method="post" id="superUserForm">
                    <h2 style="text-align: center;">Create Super Account</h2>
                    <p class="form-description">Fill in your details to create super user</p>
                    
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" placeholder="Full name" required>
                    </div>
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" placeholder="Username" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="Email address" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="password-input-container">
                            <input type="password" id="password" name="password" placeholder="Create password" required>
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
                        <button type="submit" class="btn">Create Super User</button>
                    </div>
                    <div class="register-link">
                        <a href="<?= url('/auth') ?>">← Back to Login</a>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <footer>
        <p>&copy; 2025 FerieSystem. All rights reserved.</p>
    </footer>

    <script>
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('data-target');
                const input = document.getElementById(target);
                const eyeIcon = this.querySelector('.eye-icon');
                const eyeOffIcon = this.querySelector('.eye-off-icon');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    eyeIcon.style.display = 'none';
                    eyeOffIcon.style.display = 'block';
                } else {
                    input.type = 'password';
                    eyeIcon.style.display = 'block';
                    eyeOffIcon.style.display = 'none';
                }
            });
        });

        const form = document.getElementById('superUserForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                // Form submits via POST to create-superuser route
            });
        }

        // Handle Escape key to redirect to auth page
        document.addEventListener('keydown', function(e) {
            console.log('Key pressed:', e.key);
            if (e.key === 'Escape') {
                // Get the URL from the existing back link
                const backLink = document.querySelector('.register-link a');
                console.log('Using back link URL:', backLink.href);
                backLink.click();
            }
        });
    </script>
</body>
</html>
