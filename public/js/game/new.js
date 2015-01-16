$(document).ready(function() {
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
            $('#' + id + '-img').attr('src', resp.imgUrl);
            $('#' + id + '-img-final').attr('src', resp.imgUrl);

            // 这里应该等待所有图片加载完成，偷了个懒
            bindJcrop();
        }

        function bindJcrop() {
            $('#' + id + '-img').Jcrop({
                onChange: updatePreview,
                onSelect: updatePreview
            }, function() {
                $previewContainer.appendTo($previewPanel);
            });
        }

        function updatePreview(cropInfo) {
            /*
              c: {
                  x:
                  x2:
                  y:
                  y2:
                  h:
                  w:
              }
            */

            $previewImgWidth   = $('#' + id + '-img').width();
            $previewImgHeight  = $('#' + id + '-img').height();

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
            }
        }
    });
}
