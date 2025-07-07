<?php
require_once dirname(__DIR__) . '/Helpers/LanguageHelper.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$error = $_SESSION['login_error'] ?? null;
$regError = $_SESSION['registration_error'] ?? $_SESSION['register_error'] ?? null;
$regSuccess = $_SESSION['registration_success'] ?? $_SESSION['success_message'] ?? null;

unset($_SESSION['login_error'], $_SESSION['registration_error'], $_SESSION['registration_success'], $_SESSION['register_error'], $_SESSION['success_message']);
?>
<!DOCTYPE html>
<html lang="da">
<head>
    <?php require_once __DIR__ . '/components/header.php'; ?>
    <title><?= __('auth_title') ?> - FerieSystem</title>
    <link rel="stylesheet" href="public/css/login.css">
    <script>
        window.APP_URLS = {
            login: '<?= url('/api/login') ?>',
            register: '<?= url('/api/register') ?>',
            verifyKey: '<?= url('/api/verify-key') ?>',
            auth: '<?= url('/auth') ?>'
        };
    </script>
    <script src="public/js/auth-redirect.js" defer></script>
    <script src="public/js/translations.js" defer></script>
    <script src="public/js/login.js" defer></script>
</head>
<body>
    <div class="login-form">
        <div class="container">
            <header>
                <h1 id="headerTitle"><?= __('auth_title') ?></h1>
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
                    <div class="alert alert-success">
                        <?php echo htmlspecialchars($regSuccess); ?>
                    </div>
                <?php endif; ?>
                
                <form action="<?= url('/login') ?>" method="post" id="loginForm">
                    <div class="form-group">
                        <label for="email"><?= __('user_label') ?></label>
                        <input type="text" id="email" name="email" placeholder="<?= __('email_placeholder') ?>" required>
                    </div>

                    <div class="form-group">
                        <label for="password"><?= __('password') ?></label>
                        <div class="password-input-container">
                            <input type="password" id="password" name="password" placeholder="<?= __('password_placeholder') ?>" required>
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
                                <?= __('remember_me') ?>
                            </label>
                            <div onclick="alert('<?= __('construction_in_progress') ?>')">
                                <a><?= __('forgot_password') ?></a>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <button type="submit" class="btn"><?= __('sign_in') ?></button>
                    </div>

                    <div class="register-link">
                        <?= __('no_account') ?> <a href="#" id="showRegisterKey"><?= __('register_here') ?></a>
                    </div>
                </form>

                <form id="keyVerificationForm" style="display: none;">
                    <h2><?= __('registration_key') ?></h2>
                    <p class="form-description"><?= __('registration_key_description') ?></p>
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
                        <button type="submit" class="btn"><?= __('continue') ?></button>
                    </div>
                    <div class="register-link">
                        <a href="#" id="showLogin"><?= __('back_to_login') ?></a>
                    </div>
                </form>

                <form action="<?= url('/register') ?>" method="post" id="registrationForm" style="display: none;">
                    <h2><?= __('create_account') ?></h2>
                    <p class="form-description"><?= __('registration_description') ?></p>
                    <input type="hidden" id="regRegistrationKey" name="registrationKey" value="">
                    <div class="form-group">
                        <label for="registerName"><?= __('name') ?></label>
                        <input type="text" id="registerName" name="name" placeholder="<?= __('full_name_placeholder') ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="registerUsername"><?= __('username') ?></label>
                        <input type="text" id="registerUsername" name="username" placeholder="<?= __('username_placeholder') ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail"><?= __('email') ?></label>
                        <input type="email" id="registerEmail" name="email" placeholder="<?= __('email') ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword"><?= __('password') ?></label>
                        <div class="password-input-container">
                            <input type="password" id="registerPassword" name="password" placeholder="<?= __('create_password_placeholder') ?>" required>
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
                        <label for="confirmPassword"><?= __('confirm_password') ?></label>
                        <div class="password-input-container">
                            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="<?= __('confirm_password_placeholder') ?>" required>
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
                        <button type="submit" class="btn"><?= __('create_account') ?></button>
                    </div>
                    <div class="register-link">
                        <a href="#" id="showLoginFromRegister"><?= __('back_to_login') ?></a>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <footer>
        <p>&copy; 2025 FerieSystem. <?= __('all_rights_reserved') ?>. <?= __('developed_by') ?> Thunderclaw Industries™</p>
    </footer>
    <script>
        // Handle Escape key to redirect to auth page
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const backLink = document.querySelector('.register-link a');
                backLink.click();
            }
        });
    </script>
</body>
</html>
