$(() => {

    if (window.location.href.split('/')[3] == 'login') {
        // Make modal visible
        $('.js-login-modal').toggleClass('hidden');

        // Hide exit link
        $('.js-toggle-login-exit').toggleClass('hidden');
    };

})