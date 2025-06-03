# FerieSystem

## Accessing the Application

If you're running the application using a local PHP server on port 8000, you can access it at:

[http://localhost:8000/](http://localhost:8000/)

This will take you to the home page of the FerieSystem application.

## How it Works

The application uses URL rewriting through the `.htaccess` file to route all requests to the `public/index.php` file, which then handles the routing based on the requested URL.

The main routes are defined in the `routes/web.php` file, which includes:

- Home page: `/`
- About page: `/about`
- Contact page: `/contact`
- User profile: `/user/{id}`
- API users: `/api/users`

## Development Server

If you're using PHP's built-in server, make sure you're running it from the project root directory:

```
php -S localhost:8000
```

This will allow the `.htaccess` file to properly redirect requests to the application.