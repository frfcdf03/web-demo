class UploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        var data = new FormData();
        var config = {
            headers: {'content-type': 'multipart/form-data'}
        };

       data.append('myImage', this.loader.file);

        return new Promise((resolve, reject) => {
            axios.post($f("server", "upload/main"), data, config).then(response => {
                console.log("***********"+response.data)
                //$('#img_path').val(response.data);
                resolve({
                    default: "/"+response.data //改后台地址
                })
            }).catch(error => {
                reject(error)
            });
        });
    }

    abort() {
        //
    }
} 