<?php
// Key container component for API key management
?>

<div class="key-container">
    <div class="key-display">
        <div class="key-section">
            <div class="key-info">
                <div class="key-label">Registration Key</div>
                <div class="key-status" id="key_status">No key generated</div>
            </div>
        </div>
        <div class="key-controls">
            <button id="visibility" class="btn-key-control">
                <i class="bi bi-eye-slash-fill"></i>
            </button>
            <button id="generate_key" class="btn-key-control" title="Generate New Key">
                <i class="bi bi-arrow-clockwise"></i>
            </button>
        </div>
    </div>
</div>

<link rel="stylesheet" href="/public/css/components/key_container.css">
<script src="/public/js/components/key_container.js"></script>

