<?php
// WordPress login decoy — RECON-40
// Default user hint: admin / Admin@2024!
// Real login: /users/login
header('Location: /users/login');
