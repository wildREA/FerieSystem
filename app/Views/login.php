<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - FerieSystem</title>
    <link rel="stylesheet" href="/css/login.css">
</head>
<body>
    <div class="login-form">
        <div class="container">
            <header>
                <h1>FerieSystem Login</h1>
            </header>

            <div class="content">
                <form action="/login" method="post">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" placeholder="Enter your username" required>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="Enter your password" required>
                    </div>

                    <div class="form-group">
                        <div class="forgot-password">
                            <div>
                                <input type="checkbox" id="remember" name="remember">
                                <label for="remember" style="display: inline;">Remember me</label>
                            </div>
                            <div>
                                <a href="/forgot-password">Forgot password?</a>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <button type="submit" class="btn">Login</button>
                    </div>

                    <div class="register-link">
                        Don't have an account? <a href="/register">Register here</a>
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
