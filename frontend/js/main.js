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
        console.log($('.js-signup-modal').hasClass('hidden'))
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

        $.ajax({
            type: 'POST',
            url: $(this).data('url'),
            data: {
                login: login.val(),
                password: password.val()
            },
            success: (data) => {
                login.val('');
                password.val('');
                modal.toggleClass('hidden');
                location.reload(true);
            },
            error: (error) => {
                // TODO: Add UI error message
                console.warn(error)
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

        var jqxhr = $.post(
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
                modal.toggleClass('hidden');
            }
        )
            .fail(function () {
                alert("error");
            })
    })