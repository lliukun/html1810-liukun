;
(function($) {
    //封装函数实现商品创建
    $(function() {
        function goodslist(sid, num) { //sid：商品的编号，num:商品的数量
            $.ajax({
                url: "http://localhost/js1810/banggo/php/banggodata.php",
                dataType: 'json'
            }).done(function(data) {
                $.each(data, function(index, value) {
                    if (sid == value.sid) { //比较当前传入的sid和数据里面的sid比较，相同获取当前的整条数据
                        var clonegoodslist = $('.goods-item:hidden').clone(true, true); //深度克隆被隐藏的商品列表。
                        clonegoodslist.find('.goods-pic img').attr('src', value.url);
                        clonegoodslist.find('.goods-pic img').attr('sid', value.sid);
                        clonegoodslist.find('.goods-d-info a').html(value.title);
                        clonegoodslist.find('.b-price strong').html(value.price);
                        clonegoodslist.find('.quantity-form input').val(num);
                        clonegoodslist.find('.b-sum strong').html((num * value.price).toFixed(2));
                        clonegoodslist.css('display', 'block');
                        $('.item-list').append(clonegoodslist); //追加
                        finalprice();
                    }
                })
            });
        };
        //若商品列表存在，隐藏空的购物车盒子，封装一个函数
        hidebox();

        function hidebox() {
            if (getcookie('cookiesid')) {
                $('.empty-cart').hide();
            } else {
                $('.empty-cart').show();
            }
        }
        //通过cookie渲染商品列表
        if (getcookie('cookiesid') && getcookie('cookienum')) {
            var sid = getcookie('cookiesid').split(',');
            var num = getcookie('cookienum').split(',');

            $.each(sid, function(index, value) {
                goodslist(sid[index], num[index]);
            });
        }
        //封装一个函数，算出总的数量和价格
        function finalprice() {
            var zprice = 0;
            var zcount = 0;
            $('.goods-item:visible').each(function() {
                if ($(this).find('input:checkbox').prop('checked')) {
                    zprice += parseFloat($(this).find('.b-sum strong').html());
                    zcount += parseInt($(this).find('.quantity-form input').val());
                }
            });
            $('.totalprice').html('￥' + zprice);
            $('.amount-sum em').html(zcount);
        }
        //点击全选，实现功能
        $('.allsel').on('change', function() {
            $('.goods-item:visible').find('input:checkbox').prop('checked', $(this).prop('checked'));
            $('.allsel').prop('checked', $(this).prop('checked'));
            finalprice();
        });
        var $cinput = $('.goods-item:visible').is('input:checkbox');
        $('.item-list').on('input', $cinput, function() { //事件委托
            if ($('.goods-item:visible').find('input:checkbox').size() == $('.goods-item:visible').find('input:checked').length) {
                $('.allsel').prop('checked', true);
            } else {
                $('.allsel').prop('checked', false);
            }
            finalprice();
        });
        //改变商品的数量
        $('.num-add').on('click', function() {
            var addnum = $(this).parents('.goods-item').find('.quantity-form input').val();
            addnum++;
            if (addnum > 99) {
                addnum = 99;
            }
            $(this).parents('.goods-item').find('.quantity-form input').val(addnum);
            $(this).parents('.goods-item').find('.b-sum strong').html(calcsaleprice($(this)));
            finalprice();
            changecookie($(this));

        });

        $('.num-down').on('click', function() {
            var addnum = $(this).parents('.goods-item').find('.quantity-form input').val();
            addnum--;
            if (addnum <= 0) {
                addnum = 1;
            }
            $(this).parents('.goods-item').find('.quantity-form input').val(addnum);
            $(this).parents('.goods-item').find('.b-sum strong').html(calcsaleprice($(this)));
            finalprice();
            changecookie($(this));

        });

        $('.quantity-form input').on('input', function() {
            var reg = /^\d+$/g;
            if (reg.test($(this).val())) {
                var $value = $(this).val();
                if ($value > 99) {
                    $(this).val(99);
                } else if ($value <= 0) {
                    $(this).val(1);
                } else {
                    $(this).val($value);
                }
            } else {
                $(this).val(1);
            }
            $(this).parents('.goods-item').find('.b-sum strong').html(calcsaleprice($(this)));
            finalprice();
            changecookie($(this));
        });

        //封装一个计算价格的函数
        function calcsaleprice(obj) {
            var $saleprice = parseFloat(obj.parents('.goods-item').find('.b-price strong').html());
            var $addvalue = parseInt(obj.parents('.goods-item').find('.quantity-form input').val());
            return ($saleprice * $addvalue).toFixed(2);
        }

        //取出cookie，转成数组
        var sidarr = []; //商品的编号
        var numarr = []; //商品的数量
        function cookietoarray() {
            if (getcookie('cookiesid') && getcookie('cookienum')) {
                sidarr = getcookie('cookiesid').split(',');
                numarr = getcookie('cookienum').split(',');
            }
        }

        //cookie值改变后存放到cookie里面
        function changecookie(obj) {
            cookietoarray();
            var sid = obj.parents('.goods-item').find('.goods-pic img').attr('sid');
            numarr[$.inArray(sid, sidarr)] = obj.parents('.goods-item').find('.quantity-form input').val();
            addcookie('cookienum', numarr.toString(), 7);
        }
        //删除商品
        $('.item-list').on('click', '.b-action a:even', function() { //$(this)-->.b-action a
            if (window.confirm('你确定要删除商品吗？')) {
                $(this).parents('.goods-item').remove();
                deletecookie($(this).parents('.goods-item').find('.goods-pic img').attr('sid'), sidarr);
            }
        });


        $('.operation a').first().on('click', function() {
            if (window.confirm('你确定要商品删除吗？')) {
                $('.goods-item:visible').each(function(index, ele) {
                    if ($(ele).find('input:checkbox').is(':checked')) {
                        $(this).remove();
                        deletecookie($(this).find('.goods-pic img').attr('sid'), sidarr);
                    }
                });
            }
        });
        //删除cookie

        function deletecookie(sid) {
            cookietoarray();
            var $index = $.inArray(sid, sidarr);
            sidarr.splice($index, 1);
            numarr.splice($index, 1);
            addcookie('cookiesid', sidarr.toString(), 7);
            addcookie('cookienum', numarr.toString(), 7);
        }
    })

})(jQuery);
;
(function($) {
    $(function() {
        //获取id
        var $sid = location.search.substring(1).split('=')[1];

        //2.将当前的id传给后端获取对应的数据
        $.ajax({
            url: 'http://localhost/js1810/banggo/php/detail.php',
            data: {
                sid: $sid
            },
            dataType: 'json'
        }).done(function(data) { //data:后端返回的和id对应的数据
            //console.log(data);
            $('.smallpic').attr('src', data.url);
            $('.bigpic').attr('src', data.url);
            $('.smallpic').attr('sid', data.sid);
            $('.pictitle').html("Metersbonwe" + data.title);
            $('#saleprice').html("￥" + data.price);
            $('.price em').html("￥" + data.uprice);
            $('.price>span').html(data.discount + '折');
            $('.img1').attr('src', data.url1);
            $('.img2').attr('src', data.url2);
            $('.img3').attr('src', data.url3);
            $('.img4').attr('src', data.url4);
            $('.img5').attr('src', data.url5);
        });

    })

    //放大镜效果
    $(function() {
        $('.ulist img').on('click', function() {
            var $imgurl = $(this).attr('src');
            $('.smallpic').attr('src', $imgurl);
            $('.bigpic').attr('src', $imgurl);
        })
    });
    //购物车    
    $(function() {
        var $sid = location.search.substring(1).split('=')[1];
        //点击按钮将商品的数量和id存放cookie中
        var sidarr = []; //商品的编号
        var numarr = []; //商品的数量
        if (getcookie('cookiesid') && getcookie('cookienum')) {
            sidarr = getcookie('cookiesid').split(',');
            numarr = getcookie('cookienum').split(',');
        }
        $('.detail_btn a').on('click', function() {
            if ($.inArray($sid, sidarr) == -1) { //不存在
                sidarr.push($sid);
                numarr.push($('#count').val());
                addcookie('cookiesid', sidarr.toString(), 7);
                addcookie('cookienum', numarr.toString(), 7);
            } else { //存在
                //console.log(numarr[$.inArray($sid,sidarr)]);//已经存在的值
                var newnum = parseInt($('#count').val()) + parseInt(numarr[$.inArray($sid, sidarr)]);
                numarr[$.inArray($sid, sidarr)] = newnum;
                addcookie('cookienum', numarr.toString(), 7);
            }
        });

    })
})(jQuery);
;
(function($) {
    // 轮播图效果
    $(function() {
        var $tbox = $('.lunbo_tbox');
        var $btns = $('.lunbo_bbox ol li');
        var $alis = $('.lunbo_tbox ul li');
        var $autotimer = null;
        var $num = 0;
        $tbox.hover(function() {
            clearInterval($autotimer);
        }, function() {
            $autotimer = setInterval(function() {
                $num++;
                if ($num > $btns.length - 1) {
                    $num = 0;
                }
                tabswitch();
            }, 5000)
        })
        $btns.on('mouseover', function() {
            $num = $(this).index();
            tabswitch();
        })
        $autotimer = setInterval(function() {
            $num++;
            if ($num > $btns.length - 1) {
                $num = 0;
            }
            tabswitch();
        }, 5000)

        function tabswitch() {
            $btns.eq($num).css('opacity', 1).siblings('li').css('opacity', 0.5);
            $alis.eq($num).show().siblings('li').hide();
        }
        //数据渲染加载
        $.ajax({
            url: ' http://localhost/js1810/banggo/php/banggodata.php',
            dataType: 'json'
        }).done(function(data) {
            var strhtml = '<ul>';
            $.each(data, function(index, value) {
                //console.log(value);
                strhtml += `
           <div class="goods_box">    
             <div class="goods_img">
                  <a href="details.html?sid=${value.sid}" target="_blank"><img src="${value.url}" alt="" class="goodspic"></a>
                <div class="product_tag">
                    <img src="https://img.banggo.com/sources/cms/banggo2017/PC/pc_190214bq_01.png" alt="">
                    <span class="active_price">￥349.9</span>
                </div>
             </div>
             <div class="goods_title">
                <label class="good_discount">${value.discount}折</label>
                <a href="#" class="brandname">METERSBONWE</a>
                <p style="width: 200px;height: 19px;overflow:hidden;margin-top:5px;">
                    <a href="#" class="goodsname" title="">${value.title}</a>
                </p>
             </div>
             <div class="goods_price">
                <b>￥${value.price}</b>
                <i>￥${value.uprice}</i>
             </div>
            </div>
					`;
            });
            strhtml += '</ul>';
            $('.section_3>.content_box').html(strhtml);
        });
    })

})(jQuery);
;
(function($) {
    $(function() {
        $('#form').validate({
            rules: {
                username: {
                    required: true,
                    minlength: 4,
                    maxlength: 20,
                    remote: {
                        type: 'post',
                        url: ''
                    }
                },
                password: {
                    required: true,
                    minlength: 6
                },
                telephone: {
                    required: true,
                    minlength: 11,
                    isMobile: true,
                }
            },
            messages: {
                username: {
                    required: '<em class="err">用户名不能为空</em>',
                    minlength: '用户名不能小于4',
                    maxlength: '用户名不能大于10',
                    remote: '<em class="err">用户名已存在</em>'
                },
                password: {
                    required: '<em class="err">密码不能为空</em>',
                    minlength: '密码不能小于6位'
                },
                telephone: {
                    required: '<em class="err">手机号不能为空</em>',
                    minlength: "请填写11位的手机号",
                    isMobile: '<em class="err">手机格式输入不正确</em>'
                },
            }
        });
    })
    $.validator.setDefaults({
        //添加校验成功后的执行函数--修改提示内容，并为正确提示信息添加新的样式(默认是valid)
        success: function(label) {
            label.text('√').css('color', 'green').addClass('valid');
            //label.append('<img src="signed-right-icon.png">');
        }

    });
    //手机号验证 
    jQuery.validator.addMethod("isMobile", function(value, element) {
        var length = value.length;
        var mobile = /^1[3|4|5|7|8]\d{9}$/;
        return this.optional(element) || (length == 11 && mobile.test(value));
    }, "请正确填写您的手机号码");

})(jQuery);