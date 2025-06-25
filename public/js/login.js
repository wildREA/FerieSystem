const loginForm = document.getElementById('loginForm');
const keyVerificationForm = document.getElementById('keyVerificationForm');
const registrationForm = document.getElementById('registrationForm');
const headerTitle = document.getElementById('headerTitle');

const showRegisterKeyLink = document.getElementById('showRegisterKey');
const showLoginLink = document.getElementById('showLogin');
const showLoginFromRegisterLink = document.getElementById('showLoginFromRegister');

function showForm(formToShow) {
    // Add fade-out effect to current visible form
    const currentForm = document.querySelector('.content form[style="display: block"], .content form:not([style*="none"])');
    if (currentForm && currentForm !== formToShow) {
        currentForm.style.opacity = '0';
        currentForm.style.transform = 'translateY(-10px)';
    }
    
    setTimeout(() => {
        loginForm.style.display = 'none';
        keyVerificationForm.style.display = 'none';
        registrationForm.style.display = 'none';
        formToShow.style.display = 'block';
        
        // Add fade-in effect to new form
        formToShow.style.opacity = '0';
        formToShow.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            formToShow.style.opacity = '1';
            formToShow.style.transform = 'translateY(0)';
        }, 50);
        
        if (formToShow === loginForm) {
            headerTitle.textContent = 'FerieSystem Login';
        } else if (formToShow === keyVerificationForm) {
            headerTitle.textContent = 'FerieSystem Registration';
            // Focus first key box
            keyBoxes[0].focus();
        } else if (formToShow === registrationForm) {
            headerTitle.textContent = 'FerieSystem Registration';
            // Focus first input
            document.getElementById('registerName').focus();
        }
    }, currentForm ? 150 : 0);
}

showRegisterKeyLink.addEventListener('click', function(e) {
    e.preventDefault();
    showForm(keyVerificationForm);
});

showLoginLink.addEventListener('click', function(e) {
    e.preventDefault();
    showForm(loginForm);
});

showLoginFromRegisterLink.addEventListener('click', function(e) {
    e.preventDefault();
    showForm(loginForm);
});

keyVerificationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const key = document.getElementById('registrationKey').value.trim();
    
    if (key.length === 6) {
        // Pass the registration key to the registration form
        document.getElementById('regRegistrationKey').value = key;
        showForm(registrationForm);
    } else {
        alert('Please enter a complete 6-character registration key.');
    }
});

const keyBoxes = document.querySelectorAll('.key-box');
const hiddenKeyInput = document.getElementById('registrationKey');

keyBoxes.forEach((box, index) => {
    box.addEventListener('input', function(e) {
        const cleanValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const value = cleanValue.slice(-1);
        e.target.value = value;
        
        if (value) {
            e.target.classList.add('filled');
            if (index < keyBoxes.length - 1) {
                keyBoxes[index + 1].focus();
            }
        } else {
            e.target.classList.remove('filled');
        }
        
        updateCompleteKey();
        
        checkAutoSubmit();
    });

    box.addEventListener('focus', function(e) {
        e.target.select();
    });

    box.addEventListener('keydown', function(e) {
        if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
            if (e.target.selectionStart !== e.target.selectionEnd) {
                e.target.value = '';
                e.target.classList.remove('filled');
            }
        }
        
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            keyBoxes[index - 1].focus();
            keyBoxes[index - 1].value = '';
            keyBoxes[index - 1].classList.remove('filled');
            updateCompleteKey();
        }
        
        if (e.key === 'ArrowLeft' && index > 0) {
            keyBoxes[index - 1].focus();
            setTimeout(() => keyBoxes[index - 1].select(), 0);
        }
        if (e.key === 'ArrowRight' && index < keyBoxes.length - 1) {
            keyBoxes[index + 1].focus();
            setTimeout(() => keyBoxes[index + 1].select(), 0);
        }
    });

    box.addEventListener('paste', function(e) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        for (let i = 0; i < Math.min(pastedData.length, keyBoxes.length - index); i++) {
            keyBoxes[index + i].value = pastedData[i];
            keyBoxes[index + i].classList.add('filled');
        }
        
        const nextIndex = Math.min(index + pastedData.length, keyBoxes.length - 1);
        keyBoxes[nextIndex].focus();
        
        updateCompleteKey();
        
        checkAutoSubmit();
    });
});

function updateCompleteKey() {
    const completeKey = Array.from(keyBoxes).map(box => box.value).join('');
    hiddenKeyInput.value = completeKey;
}

function checkAutoSubmit() {
    const allFilled = Array.from(keyBoxes).every(box => box.value.trim() !== '');
    
    if (allFilled) {
        // Add a small delay before auto-submitting to allow user to see the filled key
        setTimeout(() => {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            keyVerificationForm.dispatchEvent(submitEvent);
        }, 500);
    }
}

registrationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const registrationKey = document.getElementById('regRegistrationKey').value.trim();
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    if (registrationKey.length !== 6) {
        alert('Please enter a valid 6-character registration key.');
        return;
    }
    
    // Disable submit button
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';
    
    // Send AJAX request
    fetch(window.APP_URLS.register, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            registrationKey: registrationKey
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Success
            alert(data.message);
            showForm(loginForm);
            
            // Clear all forms
            registrationForm.reset();
            keyBoxes.forEach(box => {
                box.value = '';
                box.classList.remove('filled');
            });
            document.getElementById('registrationKey').value = '';
        } else {
            // Show error message
            alert(data.message || 'Registration failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        alert('An error occurred during registration. Please try again.');
    })
    .finally(() => {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
});

// Handle login form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default form submission
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const remember = document.getElementById('remember').checked;
    
    // Basic client-side validation
    if (!email || !password) {
        alert('Please enter both email and password.');
        return false;
    }
    
    // Disable submit button to prevent double submission
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';
    
    // Send AJAX request
    fetch(window.APP_URLS.login, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password,
            remember: remember
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Successful login - redirect
            window.location.href = data.redirect;
        } else {
            // Show error message
            alert(data.message || 'Login failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
    })
    .finally(() => {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
});

// Password toggle functionality
document.querySelectorAll('.password-toggle').forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        const eyeIcon = this.querySelector('.eye-icon');
        const eyeOffIcon = this.querySelector('.eye-off-icon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.style.display = 'none';
            eyeOffIcon.style.display = 'block';
        } else {
            passwordInput.type = 'password';
            eyeIcon.style.display = 'block';
            eyeOffIcon.style.display = 'none';
        }
    });
});