<?php
// Key container component for API key management
?>

<div class="key-container">
    <div class="key-display">
        <div class="key-label">API Key</div>
        <div class="key-value-wrapper">
            <input type="text" id="key_value" class="key-input" value="" readonly placeholder="Click generate to create key">
            <div class="key-controls">
                <button id="visibility" class="btn-key-control" title="Show/Hide Key">
                    <i class="fas fa-eye"></i>
                </button>
                <button id="generate_key" class="btn-key-control btn-generate" title="Generate New Key">
                    <i class="fas fa-key"></i>
                </button>
            </div>
        </div>
    </div>
</div>

<link rel="stylesheet" href="/public/css/components/key_container.css">
<script src="/public/js/components/key_container.js"></script>
