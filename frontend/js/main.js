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
        $('.js-post-text').val('');
        $('.js-post-character-count').text(0);
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
    .on('click', '.js-toggle-search-modal', function (e) {
        e.preventDefault();

        $('.js-search-modal').toggleClass('hidden');
    })
    .on('click', '.js-toggle-login-modal', function (e) {
        e.preventDefault();

        if (!$('.js-signup-modal').hasClass('hidden')) {
            $('.js-signup-modal').toggleClass('hidden')
        }

        const errorBannerClasses = [
            'general',
            'login',
            'password'
        ]
        $.each(errorBannerClasses, function (index, value) {
            const banner = $(`.js-login-${value}-errors`)
            banner.empty();
            if (!banner.hasClass('hidden')) {
                banner.toggleClass('hidden');
            }
        })

        $('.js-login-modal').toggleClass('hidden');
    })
    .on('click', '.js-toggle-signup-modal', function (e) {
        e.preventDefault();

        if (!$('.js-login-modal').hasClass('hidden')) {
            $('.js-login-modal').toggleClass('hidden')
        }

        const errorBannerClasses = [
            'general',
            'email',
            'username',
            'password',
            'password-reentry'
        ]
        $.each(errorBannerClasses, function (index, value) {
            const banner = $(`.js-signup-${value}-errors`)
            banner.empty();
            if (!banner.hasClass('hidden')) {
                banner.toggleClass('hidden');
            }
        })

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

                const parsedResponse = $.parseJSON(error.responseText).form
                const errorObj = {
                    'general': {
                        'errorClass': '.js-login-general-errors',
                        'errors': parsedResponse.errors
                    },
                    'login': {
                        'errorClass': '.js-login-login-errors',
                        'errors': parsedResponse.fields.login.errors
                    },
                    'password': {
                        'errorClass': '.js-login-password-errors',
                        'errors': parsedResponse.fields.password.errors
                    }
                }
                $.each(errorObj, function (index, value) {
                    // Create errors banner
                    var banner = $(value.errorClass);
                    banner.empty()

                    $.each(value.errors, function (index, errors) {
                        if (errors.length = 1) {
                            var p = document.createElement('p');
                            p.textContent = errors;
                            banner.append(p);
                        } else if (errors.length > 1) {
                            var ul = document.createElement('ul')
    
                            $.each(errors, function (index, error) {
                                var li = document.createElement('li')
                                li.textContent = error
                                ul.appendChild(li)
                            });
                            banner.append(ul)
                        }
                    })

                    // Un-hide errors banner, if necessary
                    if (value.errors.length >= 1 && banner.hasClass('hidden')) {
                        banner.toggleClass('hidden');
                    };
                })
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

                const parsedResponse = $.parseJSON(error.responseText).form
                const errorObj = {
                    'general': {
                        'errorClass': '.js-signup-general-errors',
                        'errors': parsedResponse.errors
                    },
                    'email': {
                        'errorClass': '.js-signup-email-errors',
                        'errors': parsedResponse.fields.email.errors
                    },
                    'username': {
                        'errorClass': '.js-signup-username-errors',
                        'errors': parsedResponse.fields.username.errors
                    },
                    'password1': {
                        'errorClass': '.js-signup-password-errors',
                        'errors': parsedResponse.fields.password1.errors
                    },
                    'password2': {
                        'errorClass': '.js-signup-password-reentry-errors',
                        'errors': parsedResponse.fields.password2.errors
                    }
                }
                $.each(errorObj, function (index, value) {
                    // Create errors banner
                    var banner = $(value.errorClass);
                    banner.empty()

                    $.each(value.errors, function (index, errors) {
                        if (errors.length = 1) {
                            var p = document.createElement('p');
                            p.textContent = errors;
                            banner.append(p);
                        } else if (errors.length > 1) {
                            var ul = document.createElement('ul')
    
                            $.each(errors, function (index, error) {
                                var li = document.createElement('li')
                                li.textContent = error
                                ul.appendChild(li)
                            });
                            banner.append(ul)
                        }
                    })

                    // Un-hide errors banner, if necessary
                    if (value.errors.length >= 1 && banner.hasClass('hidden')) {
                        banner.toggleClass('hidden');
                    };
                })
            })
    })
    .on('click', '.js-password-change-submit', function (e) {
        e.preventDefault();

    })
    .on('click', '.js-email-change-submit', function (e) {
        e.preventDefault();

    })

$('.js-post-text')
    .on('keyup', function (e) {
        var count = this.value.length;
        $('.js-post-character-count').text(count);
    })

$('.js-search-modal #search')
    .on('keyup', function (e) {

        const resultsDiv = $('.js-search-results');

        if ($(this).val()) {
            $.get(
                `${$(this).data('url')}?`,
                {
                    username: $(this).val()
                },
                function (dataHtml) {
                    if (dataHtml) {
                        resultsDiv.html(dataHtml);
                    } else {
                        resultsDiv.text('No users found.')
                    }
                }
            )
        } else {
            resultsDiv.empty()
        }
    })