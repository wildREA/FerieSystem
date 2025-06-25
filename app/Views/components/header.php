<?php
/**
 * Shared header component with favicon links
 * Include this in all views using require_once
 */

// This ensures all pages use the same favicon regardless of directory level
?>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Favicon -->
<link rel="apple-touch-icon" sizes="180x180" href="<?= asset('app/favicons/apple-touch-icon.png') ?>">
<link rel="icon" type="image/png" sizes="32x32" href="<?= asset('app/favicons/favicon-32x32.png') ?>">
<link rel="icon" type="image/png" sizes="16x16" href="<?= asset('app/favicons/favicon-16x16.png') ?>">
<link rel="manifest" href="<?= asset('app/favicons/site.webmanifest') ?>">
<link rel="shortcut icon" href="<?= asset('app/favicons/favicon.ico') ?>" type="image/x-icon">
