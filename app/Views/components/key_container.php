<?php
// Load language helper
require_once dirname(__DIR__, 2) . '/Helpers/LanguageHelper.php';
?>

<div class="key-container">
    <div class="key-display">
        <div class="key-section">
            <div class="key-info">
                <div class="key-label"><?= __('registration_key') ?></div>
                <div class="key-status" id="key_status"><span class="textWrapper"><?= __('no_key_generated') ?></span></div>
            </div>
        </div>
        <div class="key-controls">
            <button id="visibility" class="btn-key-control">
                <i class="bi bi-eye-slash-fill"></i>
            </button>
            <button id="generate_key" class="btn-key-control" title="<?= __('generate_new_key') ?>">
                <i class="bi bi-arrow-clockwise"></i>
            </button>
        </div>
    </div>
</div>

<link rel="stylesheet" href="/public/css/components/key_container.css">
<link rel="stylesheet" href="/public/css/components/toast.css">
<script src="/public/js/components/key_container.js"></script>

