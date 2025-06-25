# Key Container Component

## Usage

To use the key container component in your views, simply include it:

```php
<?php include __DIR__ . '/components/key_container.php'; ?>
```

## Features

- **Discord-inspired Design**: Small, sleek container positioned in the bottom-left corner
- **API Key Generation**: Click the key icon to generate a new random API key
- **Visibility Toggle**: Show/hide the key with the eye icon
- **Copy to Clipboard**: Click on the key input field to copy the key
- **Toast Notifications**: Visual feedback for actions
- **Responsive Design**: Adapts to mobile screens

## Styling

The component uses the website's existing color scheme:
- Primary background: `#222941`
- Secondary background: `#1a1f2c`
- Border color: `#2c3142`
- Text colors: `#ffffff` (primary), `#a0a7b5` (secondary)
- Accent color: `#007bff`

## JavaScript API

The component automatically initializes when the DOM loads. It includes:
- Key generation with visual feedback
- Clipboard functionality with fallback support
- Toast notifications
- Responsive visibility controls

## Font Awesome Icons

Make sure Font Awesome is included in your project for the icons:
- Eye/Eye-slash for visibility toggle
- Key icon for generation
- Check/info icons for notifications
