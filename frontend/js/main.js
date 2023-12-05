$.ajaxSetup({
    beforeSend: function beforeSend(xhr, settings) {
        function getCookie(name) {
            let cookieValue = null;


            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');

                for (let i = 0; i < cookies.length; i += 1) {
                    const cookie = jQuery.trim(cookies[i]);

                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) === (`${name}=`)) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }

            return cookieValue;
        }

        if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
            // Only send the token to relative URLs i.e. locally.
            xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        }
    },
});

$(document)
    .on('click', '.js-toggle-post-modal', function (e) {
        e.preventDefault();
        $('.js-post-modal').toggleClass('hidden');
    })
    .on('click', '.js-post-submit', function (e) {
        e.preventDefault();

        const postTextArea = $('.js-post-text');
        const $btn = $(this);
        const modal = $('.js-post-modal')

        if (!postTextArea.val().trim().length) {
            return false
        };

        $btn.prop('disabled', true).text('Posting!')
        $.ajax({
            type: 'POST',
            url: postTextArea.data('post-url'),
            data: {
                text: postTextArea.val().trim()
            },
            success: (dataHtml) => {
                modal.toggleClass('hidden');
                $('#posts-container').prepend(dataHtml);
                $btn.prop('disabled', false).text('New Post');
                postTextArea.val('');
            },
            error: (error) => {
                console.warn(error);
                $btn.prop('disabled', false).text('Error');
            }
        })
    })
    .on('click', '.js-follow', function (e) {
        e.preventDefault();

        const action = $(this).attr('data-action');

        $.ajax({
            type: 'POST',
            url: $(this).data('url'),
            data: {
                action: action,
                username: $(this).data('username')
            },
            success: (data) => {
                $('.js-follow-text').text(data.wording);
                $('.js-follower-count').text(data.follower_count);
                if (action == 'follow') {
                    // Change wording to Unfollow
                    $(this).attr('data-action', 'unfollow')
                } else {
                    // Change wording to Follow
                    $(this).attr('data-action', 'follow')
                }
            },
            error: (error) => {
                console.warn(error);
            }
        })
    })
    .on('click', '.js-toggle-login-modal', function (e) {
        e.preventDefault();

        if (!$('.js-signup-modal').hasClass('hidden')) {
            $('.js-signup-modal').toggleClass('hidden')
        }

        $('.js-login-modal').toggleClass('hidden');
    })
    .on('click', '.js-toggle-signup-modal', function (e) {
        e.preventDefault();

        if (!$('.js-login-modal').hasClass('hidden')) {
            $('.js-login-modal').toggleClass('hidden')
        }

        $('.js-signup-modal').toggleClass('hidden');

    })
    .on('click', '.js-login-submit', function (e) {
        e.preventDefault();

        const modal = $('.js-login-modal');
        const login = $('#email');
        const password = $('#password');

        $.post(
            $(this).data('url'),
            {
                login: login.val(),
                password: password.val()
            },
            () => {
                login.val('');
                password.val('');
                if (!modal.hasClass('hidden')) {
                    modal.toggleClass('hidden');
                }
                location.reload(true);
            }
        )
            .fail((error) => {
                const banner = $('.js-login-errors')
                banner.empty()
                const parsedResponse = $.parseJSON(error.responseText).form
                const generalErrors = parsedResponse.errors;
                const loginErrors = parsedResponse.fields.login.errors;
                const passwordErrors = parsedResponse.fields.password.errors;

                var formErrors = $.merge(generalErrors, $.merge(loginErrors, passwordErrors))

                // Create errors banner
                $.each(formErrors, function (index, value) {
                    var p = document.createElement('p');
                    p.textContent = value;
                    banner.append(p);
                })

                // Un-hide errors banner, if necessary
                if (banner.hasClass('hidden')) {
                    banner.toggleClass('hidden');
                }
            })
    })
    .on('click', '.js-signup-submit', function (e) {
        e.preventDefault();

        const modal = $('.js-signup-modal');
        const email = $('#signup-email');
        const username = $('#signup-username');
        const password1 = $('#signup-password');
        const password2 = $('#signup-password-reentry');

        $.post(
            $(this).data('url'),
            {
                email: email.val(),
                username: username.val(),
                password1: password1.val(),
                password2: password2.val()
            },
            function () {
                email.val('');
                username.val('');
                password1.val('');
                password2.val('');
                if (!modal.hasClass('hidden')) {
                    modal.toggleClass('hidden');
                }
                location.reload(true);
            }
        )
            .fail((error) => {
                const banner = $('.js-signup-errors')
                banner.empty()
                const parsedResponse = $.parseJSON(error.responseText).form
                console.log(parsedResponse)
                const generalErrors = parsedResponse.errors;
                const emailErrors = parsedResponse.fields.email.errors;
                const passwordErrors = parsedResponse.fields.password1.errors;
                const passwordReentryErrors = parsedResponse.fields.password2.errors;
                const usernameErrors = parsedResponse.fields.username.errors;

                var formErrors = $.merge(generalErrors, $.merge(emailErrors, $.merge(passwordErrors, $.merge(passwordReentryErrors, usernameErrors))))

                // Create errors banner
                $.each(formErrors, function (index, value) {
                    var p = document.createElement('p');
                    p.textContent = value;
                    banner.append(p);
                })

                // Un-hide errors banner, if necessary
                if (banner.hasClass('hidden')) {
                    banner.toggleClass('hidden');
                }
            })
    })