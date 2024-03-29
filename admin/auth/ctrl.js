/**
 * Created by jdd on 2016/7/15.
 */
app.controller('LoadingController', function ($scope, $resource, $state) {
    var $com = $resource($scope.app.host + "/auth/info/?");
    /*     $com.get(function (data) {//引入data
     $scope.session_user = $localStorage.user = data; //保存用户信息
     $state.go('app.dashboard');
     })*/
    $com.get(function () {
        $state.go('app.dashboard');
    }, function () {
        $state.go('auth.login');
    })
});
app.controller('LoginController', function ($scope, $state, $http, $resource, Base64, $localStorage, lyer, AuthService) {
    $scope.login = function (data) {
        /*       $scope.authError = ""
         var authdata = Base64.encode($scope.user.username + ':' + $scope.user.password);
         $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
         var $com = $resource($scope.app.host + "/auth/info/?");
         /!*$com.get(function(data){      //引入data
         $scope.session_user = $localStorage.user = data; //保存用户信息
         $localStorage.auth = authdata;
         $state.go('app.dashboard');
         },function(){
         $scope.authError = "服务器登录错误"
         })*!/
         if ($scope.user.username == 'admin' && $scope.user.password == '1234') {
         $localStorage.auth = authdata;
         $state.go('app.dashboard');
         } else {
         lyer.msg("服务器登录错误");
         $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
         $scope.authError = "服务器登录错误"
         }*/
        AuthService.login($scope.user.username, $scope.user.password).then(function (authenticated) {
            $state.go('app.dashboard', {}, {reload: true});
        }, function (err) {
            lyer.msg("服务器登录错误");
        });
    }
});
app.factory('Base64', function () {
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
});//弹窗
app.factory('lyer', [function () {
    // return function(msg){
    var msg = function (msg, callback) {
        layer.open({
            content: msg,
            btn: ['确认'],
            yes: function (index) {
                layer.close(index);
                if (callback) {
                    callback(index);
                }
            }

        });
    }

    var confirm = function (msg, yesCallback, noCallback, yesTitle, noTitle) {
        layer.open({
            title: '温馨提示',
            content: msg,
            btn: [yesTitle || '确认', noTitle || '取消'],
            yes: function (index) {
                if (yesCallback) {
                    yesCallback()
                }
                layer.close(index);
            },
            no: function (index) {
                if (noCallback) {
                    noCallback();
                }
                layer.close(index);
            }
        })
    }

    return {
        msg: msg,
        confirm: confirm
    }
    // };
}])