$(document).ready(function() {
    $('.raty').raty(
        {
            cancelOff : '/img/lib/cancel-off.png',
            cancelOn  : '/img/lib/cancel-on.png',
            starHalf  : '/img/lib/star-half.png',
            starOff   : '/img/lib/star-off.png',
            starOn    : '/img/lib/star-on.png',
            half      : true,
            score     : 0
        }
    );
    $('.raty').click(function() {
        var self = $(this);
        var formKeyId = self.attr('id').slice(7);
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
