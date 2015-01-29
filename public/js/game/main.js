$(document).ready(function() {
    var myGameRating = $('.myGameRating');
    for (var i = 0, length = myGameRating.length; i < length; i += 1) {
        var myFieldRating = $(myGameRating[i]);
        myFieldRating.raty(
            {
                cancelOff : '/img/lib/cancel-off.png',
                cancelOn  : '/img/lib/cancel-on.png',
                starHalf  : '/img/lib/star-half.png',
                starOff   : '/img/lib/star-off.png',
                starOn    : '/img/lib/star-on.png',
                half      : true,
                score     : myFieldRating.attr('rating')
            }
        );
        var formKeyId = myFieldRating.attr('id').slice(13);
        var score = myFieldRating.raty('score');
        $('#' + formKeyId).val(score);
    }
    myGameRating.click(function() {
        var self = $(this);
        var formKeyId = self.attr('id').slice(13); // myGameRating-
        var score = self.raty('score');
        $('#' + formKeyId).val(score);
    });

    var gameRating = $('.gameRating');
    for (var i = 0, length = gameRating.length; i < length; i += 1) {
        var fieldRating = $(gameRating[i]);
        fieldRating.raty(
            {
                cancelOff : '/img/lib/cancel-off.png',
                cancelOn  : '/img/lib/cancel-on.png',
                starHalf  : '/img/lib/star-half.png',
                starOff   : '/img/lib/star-off.png',
                starOn    : '/img/lib/star-on.png',
                half      : true,
                readOnly  : true,
                score     : fieldRating.attr('rating')
            }
        );
    }
});
