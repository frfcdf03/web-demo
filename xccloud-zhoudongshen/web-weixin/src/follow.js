$f("df",___,function(tag,_data){
    console.log("clicked!!!!!!");
    if($(tag).attr('follow')==0){//没有关注过
        $(tag).children('img').attr('src','img/icons8-heart-filled-50.png');
            var data =  $(tag).attr("data2");
        if(data==0||data==6||data==7||data==5) {
            if( $(tag).children('span').attr('data')!=undefined){
                    var num = $(tag).children('span').attr('data');
                    $(tag).children('span').attr('data',parseInt(num)+1);

                    $(tag).children('span').html(parseInt(num)+1);
                    }
            else{
                $(tag).children('span').html("已关注");
            }
        }
        else {
            $(tag).children('span').html("已关注");
        }

        $(tag).attr('follow','1');
        console.log("testFollow click"+ " "+$(tag).attr("data"));

        $f("ajax.get", $f("server", "users/follow"), {
           uid: 1,
           eid: $(tag).attr("data"),
           e_type_id: $(tag).attr("data2"),
        }, data=>console.log(data))();



    }else{//关注了
        $(tag).children('img').attr('src','img/icons8-heart-26.png');
        var data =  $(tag).attr("data2");
        if(data==0||data==6||data==7||data==5) {
            if( $(tag).children('span').attr('data')!=undefined){
            var num = $(tag).children('span').attr('data');
            $(tag).children('span').attr('data',parseInt(num)-1);
            $(tag).children('span').html(parseInt(num)-1);
            }
            else{
                $(tag).children('span').html("关注");
            }
        }
        else{
            $(tag).children('span').html("关注");
        }

        $(tag).attr('follow','0');
        console.log("testUNFollow click");

         $f("ajax.get", $f("server", "users/unfollow"), {
           uid: 1,
           eid: $(tag).attr("data"),
           e_type_id: $(tag).attr("data2"),
        }, data=>console.log(data))();

    }
});