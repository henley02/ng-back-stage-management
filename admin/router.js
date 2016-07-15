/**
 * Created by jdd on 2016/7/15.
 */
'use strict';

app
    .constant('AUTH_EVENTS', {
        'notAuthenticated': 'auth-not-authenticated',
        'notAuthorized': 'auth-not-authorized'
    })
    .constant('USER_ROLES', {
        admin: 'admin_role',
        public: 'public_role'
    })

    .run(
    function ($rootScope, $state, $stateParams, $localStorage, $http, $location, AuthService, AUTH_EVENTS) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $localStorage.auth;
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;


        $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
            if ('data' in next && 'authorizedRoles' in next.data) {
                var authorizedRoles = next.data.authorizedRoles;
                if (!AuthService.isAuthorized(authorizedRoles)) {
                    event.preventDefault();
                    $state.go($state.current, {}, {reload: true});
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                }
            }
            /*         if (!AuthService.isAuthenticated()) {
             if (next.name !== 'login') {
             event.preventDefault();
             //$location.url('/auth/login');
             $state.go('auth.login');
             }
             }*/
        });

        //监听全局页面跳转信号
        $rootScope.$on('$stateChangeSuccess', function (event, to, toParams, from, fromParams) {
            $rootScope.previousState = from;
            $rootScope.previousStateParams = fromParams;
        });
    }
)
    .service('AuthService', function ($q, $http, USER_ROLES) {
        var LOCAL_TOKEN_KEY = '';
        var username = '';
        var isAuthenticated = false; // 是否已授权
        var role = '';
        var authToken;

        function loadUserCredentials() {
            var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
            if (token) {
                useCredentials(token);
            }
        }

        function storeUserCredentials(token) {
            window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
            useCredentials(token);
        }

        function useCredentials(token) {
            username = token.split('.')[0];
            isAuthenticated = true;
            authToken = token;

            if (username == 'admin') {
                role = USER_ROLES.admin
            }
            if (username == 'user') {
                role = USER_ROLES.public
            }

            // Set the token as header for your requests!
            $http.defaults.headers.common['X-Auth-Token'] = token;
        }

        function destroyUserCredentials() {
            authToken = undefined;
            username = '';
            isAuthenticated = false;
            $http.defaults.headers.common['X-Auth-Token'] = undefined;
            window.localStorage.removeItem(LOCAL_TOKEN_KEY);
        }

        var login = function (name, pw) {
            return $q(function (resolve, reject) {
                if ((name == 'admin' && pw == '1') || (name == 'user' && pw == '1')) {
                    // Make a request and receive your auth token from your server
                    storeUserCredentials(name + '.yourServerToken');
                    resolve('Login success.');
                } else {
                    reject('Login Failed.');
                }
            });
        };

        var logout = function () {
            destroyUserCredentials();
        };

        var isAuthorized = function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
        };

        loadUserCredentials();

        return {
            login: login,
            logout: logout,
            isAuthorized: isAuthorized,
            isAuthenticated: function () {
                return isAuthenticated;
            },
            username: function () {
                return username;
            },
            role: function () {
                return role;
            }
        };

    })
    .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        return {
            responseError: function (response) {
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized
                }[response.status], response);
                return $q.reject(response);
            }
        };
    })
    .config(
    function ($stateProvider, $urlRouterProvider, USER_ROLES, $httpProvider, $cookiesProvider) {

        $httpProvider.interceptors.push('AuthInterceptor');

        $cookiesProvider.defaults = {
            path: '/',
            domain: 'ht',
            // secure:false;
        };

        $urlRouterProvider
            .otherwise('/auth/loading');

        $stateProvider
            .state('app', {
                abstract: true,
                url: '/app',
                templateUrl: 'admin/app.html',
            })
            .state('app.dashboard', {
                url: '/dashboard',
                templateUrl: 'admin/dashboard.html',
                ncyBreadcrumb: {
                    label: '<i class="fa fa-home"></i> 首页'
                }
            })
            .state('auth', {
                abstract: true,
                url: '/auth',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('admin/auth/ctrl.js');
                        }]
                }
            })
            .state('auth.loading', {
                url: '/loading',
                templateUrl: 'admin/auth/loading.html',
            })
            .state('auth.login', {
                url: '/login',
                templateUrl: 'admin/auth/login.html',
            })
            .state('app.news', {
                abstract: true,
                url: '/news',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('admin/news/ctrl.js');
                        }]
                }
            })
            .state('app.news.list', {
                url: '/list?page&search',
                templateUrl: 'admin/news/list.html',
                ncyBreadcrumb: {
                    parent: 'app.dashboard',
                    label: '新闻列表',
                }
            })
            .state('app.news.detail', {
                url: '/detail/{id}',
                templateUrl: 'admin/news/detail.html',
                ncyBreadcrumb: {
                    parent: 'app.news.list',
                    label: '编辑',
                }
            })
            .state('app.news.create', {
                url: '/create',
                templateUrl: 'admin/news/detail.html',
                ncyBreadcrumb: {
                    parent: 'app.news.list',
                    label: '新增',
                },
                data: {
                    authorizedRoles: [USER_ROLES.admin]
                }
            })
    }
);