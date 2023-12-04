$(() => {

    if (window.location.href.split('/')[3] == 'signup') {
        // Make modal visible
        $('.js-signup-modal').toggleClass('hidden');

        // Hide exit link
        $('.js-toggle-signup-exit').toggleClass('hidden');
    };

})