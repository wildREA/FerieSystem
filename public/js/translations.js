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
    'calendar_file_not_found_simple': 'Kalenderfil ikke fundet',
    
    // Student modal translations
    'student_information': 'Studerendeoplysninger',
    'contact_information': 'Kontaktoplysninger',
    'ff_hours_management': 'Ferie-timer administration',
    'current_ff_balance': 'Nuværende ferie-saldo',
    'enter_hours': 'Indtast timer',
    'add_hours': 'Tilføj timer',
    'remove_hours': 'Fjern timer',
    'quick_actions': 'Hurtige handlinger',
    'view_requests': 'Se ansøgninger',
    'send_message': 'Send besked',
    'view_history': 'Se historik',
    'close': 'Luk',
    'active': 'Aktiv',
    'error_loading_balance': 'Fejl ved indlæsning af saldo',
    'failed_to_load': 'Kunne ikke indlæses',
    'loading': 'Indlæser...',
    'hours': 'timer',
    'no_students_found': 'Ingen studerende fundet',
    'no_students_match_criteria': 'Ingen studerende matcher dine søgekriterier',
    'error_loading_students': 'Fejl ved indlæsning af studerende data',
    'failed_to_load_students': 'Kunne ikke indlæse studerende data',
    'student_data_not_available': 'Studerendedata ikke tilgængelig',
    'successfully_added': 'Succesfuldt tilføjet',
    'successfully_removed': 'Succesfuldt fjernet',
    'failed_to_add': 'Kunne ikke tilføje',
    'failed_to_remove': 'Kunne ikke fjerne',
    'error_adding': 'Fejl ved tilføjelse',
    'error_removing': 'Fejl ved fjernelse',
    'message_functionality_not_implemented': 'Beskedfunktionalitet ikke implementeret endnu',
    'loading_transaction_history': 'Indlæser transaktionshistorik...',
    'could_not_load_transaction_history': 'Kunne ikke indlæse transaktionshistorik',
    'error_loading_transaction_history': 'Fejl ved indlæsning af transaktionshistorik',
    'transaction_history': 'Transaktionshistorik',
    'no_transactions_found': 'Ingen transaktioner fundet',
    
    // FF Hours modal translations
    'adjust_ff_hours': 'Juster ferie-timer',
    'modify_ff_hours_question': 'Er du sikker på, at du vil ændre ferie-timer for denne studerende?',
    'reason': 'Årsag',
    'enter_reason_adjustment': 'Indtast årsag til justering...',
    'yes_adjust_it': 'Ja, juster dem!',
    'cancel': 'Annuller',
    
    // Preview and modal translations
    'request_details': 'Ansøgningsdetaljer',
    'preview_mode': 'Forhåndsvisningstilstand',
    'modify_form_preview_again': 'Dette viser dine ansøgningsdetaljer. Du kan ændre formularen og forhåndsvise igen',
    'close_preview': 'Luk forhåndsvisning',
    
    // Duration and calculation messages
    'end_must_be_after_start': 'Slut skal være efter start',
    'error_calculating_duration': 'Fejl ved beregning af varighed',
    
    // Modal titles
    'request_preview': 'Ansøgningsforhåndsvisning',
    'profile_information': 'Profiloplysninger',
    
    // Additional information labels
    'balance_information_unavailable': 'Saldooplysninger ikke tilgængelige',
    'student_information_header': 'Studerendeoplysninger',
    'account_information': 'Kontooplysninger'
};

// Helper function to get translation
function __(key, fallback = null) {
    return translations[key] || fallback || key;
}
