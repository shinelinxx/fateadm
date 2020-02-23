/**
*
* Fatea  	http request
*	function Predict(img_data, img_enc, pd_id, pd_key, predict_type, pred_cb)
*	function Justice( pd_id, pd_key, request_id, res_cb)
*	function QueryBalance(pd_id, pd_key, res_cb)
*
* @author Fatea
*
*/

document.write(" <script language=\"javascript\" src=\"crypto.js\" > <\/script>"); 

/*
*	Predict     	识别请求
*  		img_data		图片数据
*		pd_id 		用户id
*		pd_key			访问秘钥
*		predict_type 	验证码类型
*		pred_cb			结果数据回调
				pred_cb( ret_code, rsp_data, pred_data)
					ret_code: 		0 成功
									-1 访问失败,http 访问失败
									-2 超时
									其他 详见错误页http://docs.fateadm.com/index.php?s=/1&page_id=5
					rsp_data		访问返回结果
									RetCode    与参数1的ret_code意思一致
									ErrMsg 		当ret_code非0时，保存错误信息
									RequestId   本次识别的序列号，当识别结果不对时，可以用来申请退款
					pred_data		识别结果
									result  	正常识别时，返回识别结果在pred_data.result中

*/
function Predict(img_data, app_id, app_key, pd_id, pd_key, predict_type, pred_cb){
	var curDate = new Date();
	timestamp	= parseInt(curDate.getTime() / 1000).toString();   // 时间戳秩序精确到秒，所以 除以1000
	sign 		= CalcSign( pd_id, pd_key, timestamp);
	params 		= {
		'user_id':pd_id,
		'timestamp':timestamp,
		'sign': sign,
		'predict_type': predict_type,
		//'up_type': 'mt',
	};
	if( app_id !== null || app_id !== undefined || app_id !== ''){
		asign 	= CalcSign( app_id, app_key, timestamp);
		params['appid'] = app_id;
		params['asign'] = asign;
	}
	url 		= "http://pred.fateadm.com/api/capreg";
	var formdata = new FormData();
	for (var i in params){
		formdata.append(i,params[i]);
    }
    formdata.append("img_data",img_data);

	ajaxMFormPost(url, formdata, function(ret_code, rsp_str){
		if( ret_code == 0){
			rsp_data			= eval('('+ rsp_str + ')');
			var pred_data		= {};
			if( rsp_data.RetCode == 0){
				pred_data 		= eval('(' + rsp_data.RspData + ')');
			}
			pred_cb( rsp_data.RetCode, rsp_data, pred_data);
		}else{
			rsp_data 		= {};
			rsp_data.ErrMsg = rsp_str;
			rsp_data.RetCode = ret_code;
			pred_cb( ret_code, rsp_data, {});
		}
	})
}


/*
*	Justice     	退款请求
*		pd_id 		用户id
*		pd_key			访问秘钥
*		request_id 		退款序号
*		pred_cb			结果数据回调
				pred_cb( ret_code, rsp_data)
					ret_code: 		0 成功
									-1 访问失败,http 访问失败
									-2 超时
									其他 详见错误页http://docs.fateadm.com/index.php?s=/1&page_id=5
					rsp_data		访问返回结果
									RetCode    与参数1的ret_code意思一致
									ErrMsg 		当ret_code非0时，保存错误信息

*/
function Justice( pd_id, pd_key, request_id, res_cb){
	var curDate = new Date();
	timestamp	= parseInt(curDate.getTime() / 1000).toString();   // 时间戳秩序精确到秒，所以 除以1000
	sign 		= CalcSign( pd_id, pd_key, timestamp);
	//console.log("退款请求，当前时间戳为：" + timestamp + " pd_id: " + pd_id + " pd_key: " + pd_key + " checksum: " + sign);
	params 		= {
		'user_id':pd_id,
		'timestamp':timestamp,
		'sign': sign,
		'request_id': request_id
	};
	url 		= "http://pred.fateadm.com/api/capjust";
	ajaxPost(url, params, function(ret_code, rsp_str){
		if( ret_code == 0){
			rsp_data			= eval('('+rsp_str + ')');
			res_cb( rsp_data.RetCode, rsp_data);
		}else{
			rsp_data 		= {};
			rsp_data.ErrMsg = rsp_str;
			rsp_data.RetCode = ret_code;
			res_cb( ret_code, rsp_data);
		}
	})
}

/*
*	QueryBalance     	查询余额请求
*		pd_id 		用户id
*		pd_key			访问秘钥
*		pred_cb			结果数据回调
				pred_cb( ret_code, rsp_data)
					ret_code: 		0 成功
									-1 访问失败,http 访问失败
									-2 超时
									其他 详见错误页http://docs.fateadm.com/index.php?s=/1&page_id=5
					rsp_data		访问返回结果
									RetCode    与参数1的ret_code意思一致
									ErrMsg 		当ret_code非0时，保存错误信息
									cust_val   账上余额

*/
function QueryBalance(pd_id, pd_key, res_cb){
	var curDate = new Date();
	timestamp	= parseInt(curDate.getTime() / 1000).toString();   // 时间戳秩序精确到秒，所以 除以1000
	sign 		= CalcSign( pd_id, pd_key, timestamp);
	//console.log("查询余额请求，当前时间戳为：" + timestamp + " pd_id: " + pd_id + " pd_key: " + pd_key + " checksum: " + sign);
	params 		= {
		'user_id':pd_id,
		'timestamp':timestamp,
		'sign': sign
	};
	url 		= "http://pred.fateadm.com/api/custval";
	ajaxPost(url, params, function(ret_code, rsp_str){
		if( ret_code == 0){
			rsp_data			= eval('('+rsp_str + ')');		
			if( rsp_data.RetCode == 0){
				var bal_res 	= eval('(' + rsp_data.RspData + ')');
				rsp_data.cust_val = bal_res.cust_val;
			}
			res_cb( rsp_data.RetCode, rsp_data);
		}else{
			rsp_data 		= {};
			rsp_data.ErrMsg = rsp_str;
			rsp_data.RetCode = ret_code;
			res_cb( ret_code, rsp_data);
		}
	})
}


/*
*	Charge     	充值余额请求
*		pd_id 		用户id
*		pd_key			访问秘钥
*		cardid			充值卡id
*		cardkey			充值卡密
*		pred_cb			结果数据回调
				pred_cb( ret_code, rsp_data)
					ret_code: 		0 成功
									-1 访问失败,http 访问失败
									-2 超时
									3023 充值卡已使用
									其他 详见错误页http://docs.fateadm.com/index.php?s=/1&page_id=5
					rsp_data		访问返回结果
									RetCode    与参数1的ret_code意思一致
									ErrMsg 		当ret_code非0时，保存错误信息

*/
function Charge(pd_id, pd_key, cardid, cardkey, res_cb){
	var curDate = new Date();
	timestamp	= parseInt(curDate.getTime() / 1000).toString();   // 时间戳秩序精确到秒，所以 除以1000
	sign 		= CalcSign( pd_id, pd_key, timestamp);
    csign       = hex_md5( pd_key + timestamp + cardid + cardkey);
    console.log("充值");
    params      = {
        'user_id':pd_id,
        'timestamp':timestamp,
        'sign':sign,
        'cardid':cardid,
        'csign':csign
    };
    url         = "http://pred.fateadm.com/api/charge";
	ajaxPost(url, params, function(ret_code, rsp_str){
		if( ret_code == 0){
			rsp_data			= eval('('+rsp_str + ')');		
			res_cb( rsp_data.RetCode, rsp_data);
		}else{
			rsp_data 		= {};
			rsp_data.ErrMsg = rsp_str;
			rsp_data.RetCode = ret_code;
			res_cb( ret_code, rsp_data);
		}
	})
}


/*
*	QueryRTT     	查询网络延迟
*			客户端计算从调用开始到结束返回的时候的时间消耗，获得网络交互的总时间
*		app_id 			app id
*		app_key 		app秘钥
*		pd_id 			用户id
*		pd_key			访问秘钥
*		predict_type 	验证码类型
*		pred_cb			结果数据回调
				pred_cb( ret_code, rsp_data)
					ret_code: 		0 成功
									-1 访问失败,http 访问失败
									-2 超时
									其他 详见错误页http://docs.fateadm.com/index.php?s=/1&page_id=5
					rsp_data		访问返回结果
									RetCode    与参数1的ret_code意思一致
									ErrMsg 		当ret_code非0时，保存错误信息
						
*/
function QueryRTT(app_id, app_key, pd_id, pd_key, predict_type, pred_cb){
	var curDate = new Date();
	timestamp	= parseInt(curDate.getTime() / 1000).toString();   // 时间戳秩序精确到秒，所以 除以1000
	sign 		= CalcSign( pd_id, pd_key, timestamp);
	params 		= {
		'user_id':pd_id,
		'timestamp':timestamp,
		'sign': sign,
		'predict_type': predict_type
	};
	if( app_id !== null || app_id !== undefined || app_id !== ''){
		asign 	= CalcSign( app_id, app_key, timestamp);
		params['appid'] = app_id;
		params['asign'] = asign;
	}
	url 		= "http://pred.fateadm.com/api/qcrtt"
	ajaxPost(url, params, function(ret_code, rsp_str){
		if( ret_code == 0){
			rsp_data			= eval('('+rsp_str + ')');
			pred_cb( rsp_data.RetCode, rsp_data);
		}else{
			rsp_data 		= {};
			rsp_data.ErrMsg = rsp_str;
			rsp_data.RetCode = ret_code;
			pred_cb( ret_code, rsp_data);
		}
	})
}

/***
 * 	PredictExtend 	识别接口，只返回识别结果
 * 		img_data		图片数据
 *		pd_id 			用户id
 *		pd_key			访问秘钥
 *		predict_type 	验证码类型
 *		pred_cb			结果数据回调
 *				pred_cb(result)
 * 					result	识别结果
 */
function PredictExtend(img_data, app_id, app_key, pd_id, pd_key, predict_type, pred_cb){
    Predict(img_data, app_id, app_key, pd_id, pd_key, predict_type, function (ret_code,  rsp_data, pred_data) {
        if(ret_code == 0){
            pred_cb(pred_data['result']);
        } else {
            pred_cb("");
        }
    });
}

/***
 * JusticeExtend		退款请求，返回0代表成功
 * 		pd_id 			用户id
 *		pd_key			访问秘钥
 *		request_id 		退款序号
 *		pred_cb			结果数据回调
 *			pred_cb(ret_code)
 *				ret_code: 		退款成功返回 0
 */
function JusticeExtend( pd_id, pd_key, request_id, res_cb){
    Justice(pd_id,pd_key,request_id,function (ret_code) {
        res_cb(ret_code);
    });
}

/***
 * ChargeExtend  充值接口，返回0代表成功
 *		pd_id 			用户id
 *		pd_key			访问秘钥
 *		cardid			充值卡id
 *		cardkey			充值卡密
 *		pred_cb			结果数据回调
 *			pred_cb(ret_code)
 *				ret_code: 		退款成功返回 0
 */
function ChargeExtend(pd_id, pd_key, cardid, cardkey, res_cb){
    Charge(pd_id,pd_key,cardid,cardkey,function (ret_code) {
        res_cb(ret_code);
    });
}

/***
 *  QueryBalanceExtend		余额查询，只返回余额
 * 		pd_id 		用户id
 *		pd_key			访问秘钥
 *		pred_cb			结果数据回调
 *				pred_cb(cust_val)
 *					cust_val 			账上余额
 */
function QueryBalanceExtend(pd_id, pd_key, res_cb){
    QueryBalance(pd_id,pd_key,function (ret_code, rsp_data) {
        if(ret_code == 0){
            res_cb(rsp_data.cust_val);
        } else {
            res_cb(NaN);
        }
    });
}
//-------------------------------------------------//

function CalcSign(pd_id, pd_key, timestamp){
	md5_chk		= hex_md5(timestamp + pd_key);
	sign_chk	= hex_md5( pd_id + timestamp + md5_chk);
	return sign_chk;
}

function EncodeImgData( img_data, enc_flag){
	var str 	= img_data;
	if( enc_flag != true){
		var b 		= new Base64();
		str 		= b.encode(img_data);
	}
	var data 	= encodeURIComponent(str);
	return data;
}


// ajax 对象
function ajaxObject() {
    var xmlHttp;
    try {
        // Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
        } 
    catch (e) {
        // Internet Explorer
        try {
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
            try {
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
                //alert("您的浏览器不支持AJAX！");
                return false;
            }
        }
    }
    return xmlHttp;
}
 
// ajax post请求：
function ajaxPost ( url , data , fncallback ) {
    var ajax = ajaxObject();
    var timeout = false;
    var timer = setTimeout( function(){
        timeout = true;
        ajax.abort();
    }, 60000 );
    ajax.open( "post" , url , true );
    ajax.setRequestHeader( "Content-Type" , "application/x-www-form-urlencoded");
    ajax.onreadystatechange = function () {
        if( ajax.readyState == 4 ) {    	
        	if( timeout ) {
        		// already timeout happened 
        		fncallback(-2, "http timeout failed!");
        		return;
        	}
        	clearTimeout( timer );
            if( ajax.status == 200 ) {
                fncallback(0, ajax.responseText);
            }
            else {
                fncallback(-1, "http request failed! http error code: " + ajax.status);
            }
        }
    };
    function DictToSendStr( params){
    	var str 	= "";
    	var first 	= true;
    	for( var i in params){
    		if( first){
    			first 	= false;
    		}else{
    			str += "&";
    		}
    		str += i + "=" + params[i];
    	}
    	return str;
    }
    str_data 		= DictToSendStr( data);
    ajax.send(str_data);
}

function ajaxMFormPost(url , data , fncallback ) {
    var ajax = ajaxObject();
    var timeout = false;
    var timer = setTimeout( function(){
        timeout = true;
        ajax.abort();
    }, 60000 );
    ajax.open( "post" , url , true );
    ajax.setRe
    ajax.onreadystatechange = function () {
        if( ajax.readyState == 4 ) {
            if( timeout ) {
                // already timeout happened
                fncallback(-2, "http timeout failed!");
                return;
            }
            clearTimeout( timer );
            if( ajax.status == 200 ) {
                fncallback(0, ajax.responseText);
            }
            else {
                fncallback(-1, "http request failed! http error code: " + ajax.status);
            }
        }
    };
    ajax.send(data);
}

function ReadFile(file, load_cb) {
	//console.log("read file: " + file);
    var reader = new FileReader();//new一个FileReader实例
    reader.onload = function() {
    	// 没做异常判断
    	file_data		= this.result;
    	file_data		= file_data.split(",");
    	file_data		= file_data.pop();
    	load_cb( file_data);
	};
    reader.readAsDataURL(file);
}
