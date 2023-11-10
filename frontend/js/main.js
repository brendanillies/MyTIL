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

$(document).on('click', '.js-toggle-modal', function(e) {
    e.preventDefault();
    $('.js-modal').toggleClass('hidden');
})
.on('click', '.js-submit', function(e) {
    e.preventDefault();

    const postTextArea = $('.js-post-text');
    const $btn = $(this);
    const modal = $('.js-modal')

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
.on('click', '.js-follow', function(e) {
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