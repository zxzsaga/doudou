$(document).ready(function() {
    // $('#width').val($('.preview-container').width());
    // $('#height').val($('.preview-container').height());

    $("ul.dropdown-menu").on("click", { 'data-stopPropagation': true }, function(e) {
        e.stopPropagation(); // Stop closing memu
    });

    listenImgUploadChange();
});

function listenImgUploadChange() {
    $('.imgUpload').change(function() {
        var id = $(this).attr('id'); // cover
        var file = this.files[0];
        var formData = new FormData();
        formData.append(id, file);

        var $previewPanel     = $('.preview-panel');
        var $previewContainer = $('.preview-container');
        var $previewImg       = $('#' + id + '-img-final');
        var $previewContainerWidth  = $previewContainer.width();
        var $previewContainerHeight = $previewContainer.height();
        var $previewImgWidth;
        var $previewImgHeight;

        var jcropApi;

        sendRequest();

        function sendRequest() {
            $.ajax({
                type: 'POST',
                url: '/img/upload',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                success: onSuccess
            });
        }

        function onSuccess(resp) {
            if (resp.code !== 0) {
                console.log(resp);
                return;
            }

            $('#' + id + '-img').css('height', 'auto');
            $('#' + id + '-img-final').css('height', 'auto');

            $('#' + id + '-img').attr('src', resp.imgUrl);
            $('#' + id + '-img-final').attr('src', resp.imgUrl);
            $('#imgUrl').val(resp.imgUrl);
            // $('#width').text($('.preview-container').width());
            // $('#height').text($('.preview-container').height());
            // TODO: 这里是否应该等待所有图片加载完成
            bindJcrop();
        }

        function bindJcrop() {
            var oldJcropApi = $('#' + id + '-img').data('Jcrop');
            if (oldJcropApi) {
                oldJcropApi.destroy();
            }
            $('#' + id + '-img').Jcrop({
                onChange: updatePreview,
                onSelect: updatePreview
            }, function() {
                // $previewContainer.appendTo($previewPanel);
                jcropApi = this;
            });
        }

        function updatePreview(cropInfo) {
            // c: {
            //     x:
            //     x2:
            //     y:
            //     y2:
            //     h:
            //     w:
            // }
            $previewImgWidth  = $('#' + id + '-img').width();
            $previewImgHeight = $('#' + id + '-img').height();

            if (parseInt(cropInfo.w) > 0) {
                var widthRatio = $previewContainerWidth / cropInfo.w;
                $previewContainer.css({
                    height: Math.round(widthRatio * cropInfo.h) + 'px'
                });

                $previewImg.css({
                    width: Math.round(widthRatio * $previewImgWidth) + 'px',
                    height: Math.round(widthRatio * $previewImgHeight) + 'px',
                    marginLeft: '-' + Math.round(widthRatio * cropInfo.x) + 'px',
                    marginTop: '-' + Math.round(widthRatio * cropInfo.y) + 'px'
                });
                $('#x1').val(cropInfo.x);
                $('#y1').val(cropInfo.y);
                $('#x2').val(cropInfo.x2);
                $('#y2').val(cropInfo.y2);
                $('#w').val(cropInfo.w);
                $('#h').val(cropInfo.h);
                $('#width').text($('.preview-container').width());
                $('#height').text($('.preview-container').height());
            }
        }
    });
}
