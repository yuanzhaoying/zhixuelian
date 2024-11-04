
window.onload=function() {
    //获取主容器的宽度
    var content = document.getElementsByClassName("col-md-12")[0];
    var contentWidth = content.offsetWidth;
    console.log(contentWidth);
    var imurl=document.getElementsByClassName('movie-img');
    console.log(imurl);
    //获取单个图片的宽度
    // var imgs = content.children;
    var imgs = $(".movie-box");
    var imgsWidth = imgs[0].offsetWidth;
    console.log(imgsWidth);
    //第一行可以放多少张照片
    var nums = Math.floor(contentWidth/imgsWidth);//向下取整
    console.log(nums);
	imgLocation(imurl);  //页面加载完成即显示部分图片
	window.onscroll = function(){
		imgLocation(imurl); //滚动过程中动态加载图片
    };
        
   
	function imgLocation(arr) {
        //收集第一排所有高度
        var arrHeight = [];
        var arrtop =[];
        for(var i=0;i<imgs.length;i++){
            if(i<nums){
                arrHeight.push(imgs[i].offsetHeight);
                arrtop.push(0);
            }else{
                //创建第一个元素的对象
                var obj = {
                    minH:arrHeight[0],
                    minI:0
                }
                for(var j=0;j<arrHeight.length;j++){
                    if(arrHeight[j] < obj.minH){
                        obj.minH = arrHeight[j],
                        obj.minI = j
                    
                    }             
                }
                // console.log(obj);
                imgs[i].style.position = 'absolute';
                imgs[i].style.left = imgs[obj.minI].offsetLeft + 'px';
                imgs[i].style.top = obj.minH + 'px';
                arrtop.push(obj.minH); 
                arrHeight[obj.minI] = arrHeight[obj.minI] + imgs[i].offsetHeight;
            }
        }
        // console.log(arrHeight);
        // console.log(arrtop);
		for (var i = 0; i < arr.length; i++) {
            var scrollTop=window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop;
            var clientH=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight;
            var imgTop=getTop(arr[i]);
            // var imgTop = arrtop[i];
            // console.log(imgTop);
            // console.log("图片距离顶部高度imgtop");
            // console.log(arrtop[i]);
            if(imgTop < scrollTop + clientH&& imgTop > scrollTop&& !arr[i].isLoad){ //判断图片是否在屏幕中
                arr[i].isLoad=true; //标记图片是否已经加载过了
                // console.log("标记图片是否已经加载过了");
                afterLoad(arr[i]);  
            }
		
		}
	}
	function afterLoad(obj){
        var url=obj.getAttribute('dataSrc');
        console.log("图片为");
        console.log(url);
		obj.src=url;  //显示图片
    }
    function getTop(img){
        var offsetTop=0;
        do{
            
            offsetTop = offsetTop + img.offsetTop;
            // console.log("及顶部距离");
            img=img.offsetParent;
            // console.log(img);
        }while(img.nodeName!='BODY');//offsetTop是相对于offserParent的，因此用offseParent
        // console.log("及顶部距离 777");
        // console.log(img.offsetTop);
        return offsetTop;
        
    }
    $(function(){
        $('#sort').change(function() {
            var se = $(this).children('option:selected').val();
            var sed = $(this).children('option:selected').text();
            console.log(se);//value
            console.log(sed);//文本
            if(se){
                $.ajax({     
                    url:'http://127.0.0.1:3097/'+se,
                    type:'get',
                    // data: _this.serialize(),
                    // dataType: 'text',
                    success: function(res){
                    //    console.log(res);
                        // console.log('dsflsjdfkj');
                        $("#title").html(res.title);
                        
                    },
                    error: function(xhr, status, error) {
                        // console.log(xhr);
                        // console.log(status);
                        // console.log(error);
                        }
                    
                })
                // .fail(function (errorThrown) {
                    /*打印jqXHR对象的信息*/
                //     console.log(errorThrown);
                // });
            }
            return false;
        })
    })
   
}
