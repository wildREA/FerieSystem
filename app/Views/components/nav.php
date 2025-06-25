<?php
/**
 * Navigation Component
 * 
 * Example navigation using URL helper functions
 */
?>
<nav class="navbar">
    <div class="navbar-brand">
        <a href="<?= url('/') ?>">FerieSystem</a>
    </div>
    
    <div class="navbar-menu">
        <ul class="navbar-nav">
            <li class="nav-item">
                <a href="<?= url('/dashboard') ?>" class="nav-link">Dashboard</a>
            </li>
            <li class="nav-item">
                <a href="<?= url('/requests') ?>" class="nav-link">Requests</a>
            </li>
            <li class="nav-item">
                <a href="<?= url('/new-request') ?>" class="nav-link">New Request</a>
            </li>
            <li class="nav-item">
                <a href="<?= url('/calendar') ?>" class="nav-link">Calendar</a>
            </li>
            <li class="nav-item">
                <a href="<?= url('/logout') ?>" class="nav-link">Logout</a>
            </li>
        </ul>
    </div>
</nav>

<!-- Include CSS for navigation -->
<link rel="stylesheet" href="<?= asset('public/css/nav.css') ?>">