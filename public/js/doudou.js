$(document).ready(function() {
    $('.fileUpload').change(function() {
        var id = $(this).attr('id');
        var file = this.files[0];
        var formData = new FormData();
        formData.append(id, file);
        $.ajax({
            type: 'POST',
            url: '/file/upload',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {
                console.log(data);
            }
        });
    });
});
