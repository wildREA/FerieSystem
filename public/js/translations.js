// Danish translations for JavaScript
const translations = {
    'auth_title': 'FerieSystem Log ind',
    'registration_title': 'FerieSystem Registrering',
    'please_enter_complete_key': 'Indtast venligst en komplet 8-cifret registreringsnøgle',
    'key_verification_error': 'Der opstod en fejl under verifikation af nøglen. Prøv igen',
    'please_fill_all_fields': 'Udfyld venligst alle felter',
    'please_enter_valid_email': 'Indtast venligst en gyldig e-mailadresse',
    'please_enter_valid_key': 'Indtast venligst en gyldig 8-cifret registreringsnøgle',
    'registration_failed_try_again': 'Registrering mislykkedes. Prøv igen',
    'registration_error': 'Der opstod en fejl under registrering. Prøv igen',
    'please_enter_email_password': 'Indtast venligst både e-mail og adgangskode',
    'login_failed_try_again': 'Log ind mislykkedes. Prøv igen',
    'login_error': 'Der opstod en fejl under log ind. Prøv igen',
    'approving_request_please_wait': 'Godkender ansøgningen, vent venligst',
    'denying_request_please_wait': 'Afviser ansøgningen, vent venligst',
    'copied_to_clipboard': 'Kopieret til udklipsholder',
    'please_select_pdf_file': 'Vælg venligst en PDF-fil først',
    'please_enter_valid_hours': 'Indtast venligst et gyldigt antal timer',
    'please_provide_reason': 'Angiv venligst en begrundelse for justeringen',
    'please_select_dates': 'Vælg venligst datoer',
    'please_fill_required_fields': 'Udfyld venligst alle påkrævede felter korrekt',
    'please_select_start_end_dates': 'Vælg venligst start- og slutdato for at forhåndsvise',
    'request_submitted_successfully': 'Ansøgning sendt med succes!',
    'short_notice_warning': '(Kort varsel - kan tage længere tid at godkende)',
    'success': 'Succés',
    'checking_auth_status': 'Kontrollerer godkendelsesstatus...',
    'network_error': 'Netværks- eller serverfejl',
    'superuser': 'Underviser',
    'instructor': 'Underviser',

    // Calendar translations
    'select_pdf_first': 'Vælg venligst en PDF-fil først',
    'only_pdf_supported': 'Kun PDF-filer understøttes',
    'uploading_calendar': 'Uploader kalender...',
    'calendar_uploaded_successfully': 'Kalender uploadet med succes',
    'upload_failed': 'Upload mislykkedes',
    'removing_calendar': 'Fjerner kalender...',
    'calendar_removed': 'Kalenderen er blevet fjernet',
    'failed_to_remove_calendar': 'Kunne ikke fjerne kalender',
    'calendar_loaded': 'Kalender indlæst (uploadet: %s)',
    'could_not_check_calendar': 'Kunne ikke kontrollere eksisterende kalender: %s',

    // Button and action states
    'creating_account': 'Opretter konto...',
    'signing_in': 'Logger ind...',
    'submitting': 'Indsender...',

    // Key container messages
    'no_key_generated': 'Ingen nøgle genereret',
    'error_generating_key': 'Fejl ved generering af nøgle',
    'cannot_hide_without_key': 'Kan ikke skjule uden en nøgle',
    'no_key_available_copy': 'Ingen nøgle tilgængelig at kopiere',
    'registration_key_copied': 'Registreringsnøgle kopieret til udklipsholder',
    'failed_copy_clipboard': 'Kunne ikke kopiere nøgle til udklipsholder',

    // FF Hours management
    'add_ff_hours': 'Tilføj ferie-timer',
    'remove_ff_hours': 'Fjern ferie-timer',
    'add_hours_confirmation': 'Er du sikker på, at du vil tilføje %s timer til denne studerendes ferie-saldo?',
    'remove_hours_confirmation': 'Er du sikker på, at du vil fjerne %s timer fra denne studerendes ferie-saldo?',

    // Request management modal titles
    'approve_request': 'Godkend ansøgning',
    'deny_request': 'Afvis ansøgning',
    'processing': 'Behandler...',

    // Authentication check
    'checking_auth_status': 'Kontrollerer godkendelsesstatus...',
    'user_id_not_available': 'Bruger-ID ikke tilgængeligt',
    'user_id_required': 'Bruger-ID er påkrævet',
    'request_id_required_echo': 'Ansøgnings-ID er påkrævet',
    'invalid_json_input': 'Ugyldigt JSON-input',
    'missing_required_fields_ff': 'Manglende påkrævede felter: student_id, action, hours, reason',
    'only_superusers_adjust_ff': 'Kun undervisere kan justere ferie-timer',
    'api_endpoint_not_found': 'API-endpoint ikke fundet',
    'calendar_file_not_found_simple': 'Kalenderfil ikke fundet'
};

// Helper function to get translation
function __(key, fallback = null) {
    return translations[key] || fallback || key;
}
