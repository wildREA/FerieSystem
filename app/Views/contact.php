<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us - FerieSystem</title>
    <link rel="stylesheet" href="/css/contact.css">
</head>
<body>
    <header>
        <h1>Contact Us - FerieSystem</h1>
    </header>

    <div class="container">
        <div class="content">
            <h2>Contact Page</h2>
            <p>This is a test contact page for the FerieSystem application.</p>

            <div class="contact-info">
                <h3>Contact Information</h3>
                <p>Email: contact@feriesystem.com</p>
                <p>Phone: +45 12 34 56 78</p>
                <p>Address: Example Street 123, 1234 Copenhagen, Denmark</p>
            </div>

            <div class="contact-form">
                <h3>Send us a message</h3>
                <form action="#" method="post">
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="name" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>

                    <div class="form-group">
                        <label for="subject">Subject:</label>
                        <input type="text" id="subject" name="subject" required>
                    </div>

                    <div class="form-group">
                        <label for="message">Message:</label>
                        <textarea id="message" name="message" rows="5" required></textarea>
                    </div>

                    <button type="submit">Send Message</button>
                </form>
            </div>
        </div>
    </div>

    <footer>
        <p>&copy; 2023 FerieSystem. All rights reserved.</p>
    </footer>
</body>
</html>
