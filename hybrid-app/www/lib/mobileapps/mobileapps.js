/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

;(function() {

    'use strict';

    // ---- polyfills --- //
    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }

    if (!Object.assign) {
        Object.defineProperty(Object, 'assign', {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function(target) {
                if (target === undefined || target === null) {
                    throw new TypeError('Cannot convert first argument to object');
                }

                var to = Object(target);
                for (var i = 1; i < arguments.length; i++) {
                    var nextSource = arguments[i];
                    if (nextSource === undefined || nextSource === null) {
                        continue;
                    }
                    nextSource = Object(nextSource);

                    var keysArray = Object.keys(Object(nextSource));
                    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                        var nextKey = keysArray[nextIndex];
                        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                        if (desc !== undefined && desc.enumerable) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
                return to;
            }
        });
    }

})();
;
/**
 * The cq namespace.
 * @namespace cq
 */
var cq = window.cq || {};

/**
 * The cq.mobileapps namespace.
 * @namespace cq.mobileapps
 */
cq.mobileapps = cq.mobileapps || {};

/**
 * The cq.mobileapps.auth namespace.
 * @namespace cq.mobileapps.auth
 */
cq.mobileapps.auth = cq.mobileapps.auth || {};

/**
 * The cq.mobileapps.datastore namespace.
 * @namespace cq.mobileapps.datastore
 */
cq.mobileapps.datastore = cq.mobileapps.datastore || {};

/**
 * The cq.mobileapps.provider namespace.
 * @namespace cq.mobileapps.provider
 */
cq.mobileapps.provider = cq.mobileapps.provider || {};

/**
 * The cq.mobileapps.targeting namespace.
 * @namespace cq.mobileapps.targeting
 */
cq.mobileapps.targeting = cq.mobileapps.targeting || {};;
/**
 * The cq.mobileapps.util namespace provides utility functions.
 *
 * @namespace cq.mobileapps.util
 */
;(function(ns) {
    'use strict';

    ns.util = ns.util || (function(undefined) {

            /**
             * Iterates over the object's properties a query string from the properties of the object.
             * The query string's key and values will be encoded.
             *
             * @param {object} o - The object literal.
             * @returns {string} string - A string in the format of key1=value1&key2=value2.
             * @alias param
             * @memberof! cq.mobileapps.util#
             */
            function _param(o) {
                var r20 = /%20/g;

                return Object.keys(o).map(function(k) {
                    return encodeURIComponent(k) + '=' + encodeURIComponent(o[k]);
                }).join("&").replace(r20, "+");
            }

            /**
             * Encode the input string into a Base64 encoded value and return it.
             * @param {string} input the string to encode
             * @returns {string} a Base64 encoded string.
             */
            function _base64Encode( input ) {
                return window.btoa(input);
            }

            /**
             * Decode the input string from a Base64 string to a non encode string.
             * @param {string} input the string to decode
             * @returns {string} a non encoded string.
             */
            function _base64Decode( input ) {
                return window.atob(input);
            }

            return {
                param: _param,
                base64Encode: _base64Encode,
                base64Decode: _base64Decode
            };

        })();

})(cq.mobileapps);
;
/**
 * The cq.mobileapps.util namespace provides utility functions.
 *
 * @namespace cq.mobileapps.util
 */
;(function(ns, undefined) {
    'use strict';

    ns.util.file = ns.util.file || (function(undefined) {

            function _getAbsolutePath(path) {
                var currentLocation = window.location.href;
                var indexOfWWW = currentLocation.indexOf('/www/');
                if (indexOfWWW !== -1) {
                    return currentLocation.substring(0, indexOfWWW + 5) + path;
                }
                return null;
            }

            function _loadFile(path, callback, requestHeaders) {
                var url = _getAbsolutePath(path);
                if (url === null) {
                    callback("Unable to resolve file path: " + path);
                    return;
                }

                var request = new XMLHttpRequest();
                request.open('GET', url, true);

                // Set request headers if they have been provided
                if (requestHeaders !== null &&
                    typeof requestHeaders === "object") {
                    for (var property in requestHeaders) {
                        if (requestHeaders.hasOwnProperty(property)) {
                            request.setRequestHeader(property, requestHeaders[property]);
                        }
                    }
                }

                request.onload = function () {
                    if ((request.status >= 200 && request.status < 400) || request.status === 0) {
                        // Success
                        return callback(null, request.responseText);
                    } else {
                        // We reached our target server, but it returned an error
                        return callback('Request to url: [' + url + '] returned status: [' + request.status + '].');
                    }
                };

                request.onerror = function () {
                    // There was a connection error of some sort
                    return callback('Request to url: [' + url + '] resulted in a connection error.');
                };

                request.send();
            }

            // if we can't parse the data then we return an empty object
            function _fetchJSON(path, callback) {
                _loadFile(path, function (error, data) {
                    if (error) {
                        console.error("Unable to load " + path + " from the location " + _getAbsolutePath(path));
                        callback(error);
                    } else {
                        var json = {};
                        try {
                            json = JSON.parse(data);
                        } catch (e) {
                            console.warn("unable to parse the data from loading " + _getAbsolutePath(path));
                        }

                        callback(null, json);
                    }
                });
            }

            function _fetchHTML(path, callback) {
                _loadFile(path, function (error, data) {
                    if (error) {
                        console.error("Unable to load " + path + " from the location " + _getAbsolutePath(path));
                        callback(error);
                    } else {
                        callback(null, data);
                    }
                });
            }

            return {
                fetchJSON: _fetchJSON,
                fetchHTML: _fetchHTML
            };

        })();

})(cq.mobileapps);
;
;(function(window, ns, undefined) {

    'use strict';

    /**
     * The base object for different authorization schemes to extends.  For
     * example OAuth and Basic auth should extend the Auth class.
     *
     * This class also exports cq.mobilesapps.auth.getToken and cq.mobileapps.auth.getServer
     * functions such that other apis can get access to the token or server values.
     *
     * @param {string} server - the aem server url.  Most cases this should point to
     * your publish AEM instance.
     *
     * @param {string} token - a previously obtained token to associate with this Auth class.
     *
     * @class
     * @memberof! cq.mobileapps.auth
     * @since 1.0
     */
    function Auth(server, token) {
        var _token;
        var _server;

        if (server) {
            if (!/^https?:\/\//i.test(server)) {
                throw Error("Please specify the protocol for your host. [http | https]");
            }

            if (server.charAt(server.length - 1) !== '/') {
                server = server + '/';
            }
        } else {
            throw Error("Server url must not be empty");
        }

        _server = server;
        _token = token;

        this._getServer = function() {
            return _server;
        };

        this._getToken = function() {
            return _token;
        };

        this._setToken = function(token) {
            _token = token;
        };

        /**
         * Return the AEM server url.
         *
         * @returns {string} the server url.
         *
         * @since 1.0
         */
        Auth.prototype.getServer = function() {
            return this._getServer();
        };

        /**
         * Return the authorized token.
         *
         * @returns {string} token - The authentication token.
         *
         * @since 1.0
         */
        Auth.prototype.getToken = function() {
            return this._getToken();
        };

        /**
         * Set the token that was generated when the user was authenticated.
         *
         * @param {string} token - the authentication token.
         *
         * @since 1.0
         */
        Auth.prototype.setToken = function(token) {
            this._setToken(token);
        };
    }

    /**
     * @callback cq.mobileapps.auth.Auth~authorizeCallback
     * @param {string} error - The value of error will be non null if there was an error authenticating.
     * @param {object} result - The response from the server's authorization as a JSON object.
     */

    /**
     * The authorize function must be overriden by subclasses and provide authentication for the
     * user. The results of the authorization must call setToken() with the authentication token.
     *
     * @param {object} params - additional parameters to be sent to the server.
     * @param {cq.mobileapps.auth.Auth~authorizeCallback} callback - The callback function
     *
     * @since 1.0
     */
    Auth.prototype.authorize = function(params, callback) {
        throw Error("Subclasses must override authorize");
    };

    ns.Auth = Auth;

})(this, cq.mobileapps.auth);


;
;(function(ns, undefined) {

    'use strict';

    var AEM_AUTHORIZE_URL = 'oauth/authorize',
        AEM_TOKEN_URL     = 'oauth/token',
        authWindow;

    var LOCAL_STORAGE = {
        ACCESS_TOKEN :  'access_token',
        REFRESH_TOKEN : 'refresh_token',
        EXPIRES_AT :    'expires_at'
    };

    /**
     * Authenticate against the AEM server instance by using OAuth.
     *
     * @param {object} params
     * @param {string} params.server - the aem server url.  Most cases this should point to your publish AEM instance.
     * @param {string} params.client_id - the oAuth client id value
     * @param {string} params.client_secret - the oAuth client secret value
     * @param {string} params.redirect_uri - the url to be redirected to after authentication
     *
     * @augments cq.mobileapps.auth.Auth
     * @memberof cq.mobileapps.auth
     * @class
     *
     * The cq.mobileapps.auth.oauth namespace provides oauth authentication.  See the tutorial {@tutorial cq.mobileapps.auth.oauth}
     */
    function OAuth(params) {

        if (!params.server) {
            throw Error("Missing mandatory server parameter");
        }

        if (!params.client_id) {
            throw Error("Missing mandatory client_id parameter");
        }

        if (!params.redirect_uri) {
            throw Error("Missing mandatory redirect_uri parameter");
        }

        if (!params.client_secret) {
            throw Error("Missing mandatory client_secret parameter");
        }

        ns.Auth.call(this, params.server);

        this._clientId     = params.client_id;
        this._clientSecret = params.client_secret;
        this._redirectURI  = params.redirect_uri;
    }

    function _setToken(token) {
        /* jshint validthis: true */
        if (token === null) {
            localStorage.removeItem(LOCAL_STORAGE.ACCESS_TOKEN);
            localStorage.removeItem(LOCAL_STORAGE.REFRESH_TOKEN);
            localStorage.removeItem(LOCAL_STORAGE.EXPIRES_AT);

            this.setToken(null);
        } else {
            localStorage.setItem(LOCAL_STORAGE.ACCESS_TOKEN, token.access_token);
            localStorage.setItem(LOCAL_STORAGE.REFRESH_TOKEN, token.refresh_token);
            // Calculate exactly when the token will expire, then subtract one minute to give ourselves a small buffer.
            var now = new Date().getTime();
            var expiresAt = now + parseInt(token.expires_in, 10) * 1000 - 60000;
            localStorage.setItem(LOCAL_STORAGE.EXPIRES_AT, expiresAt);

            this.setToken(token.access_token);
        }
    }

    /**
     * OAuth logout is a no-op.  Logout simply calls the callback function with
     * no error.
     * //TODO: add callback docs
     */
    function _logout(callback) {
        /* jshint validthis: true */
        _setToken.call(this, null);

        if (callback && typeof callback === 'function') {
            callback(null);
        }
    }

    /**
     * Authorize against the OAuth server passing in the parameters.
     *
     * @param {cq.mobileapps.auth.Auth~authorizeCallback} callback - The callback function
     * @return {object} the oauth window that was opened
     *
     * @memberof! cq.mobileapps.auth.OAuth
     *
     * @alias authorize
     * @since 1.0
     */
    function _authorize(callback) {
        /* jshint validthis: true */
        var self = this;

        var urlParams = cq.mobileapps.util.param({
            client_id: this._clientId,
            scope: 'profile',
            redirect_uri: this._redirectURI,
            response_type: 'token'
        });

        var url = self.getServer() + AEM_AUTHORIZE_URL + "?" + urlParams;

        function loadStartListener(e) {

            var url = e.url;

            var code = /[\?&]code=(.+)$/.exec(url);
            var error = /[\?&]error=(.+)$/.exec(url);

            // if we have a code or error we can close the window
            if (code || error) {
                authWindow.close();
            }

            // if we have a code we can now exchange the authorization code for an access token
            if (code) {
                var params = cq.mobileapps.util.param({
                    code: code[1],
                    client_id: self._clientId,
                    client_secret: self._clientSecret,
                    redirect_uri: self._redirectURI,
                    grant_type: 'authorization_code'
                });

                var xhr = new XMLHttpRequest();
                xhr.open("POST", self.getServer() + AEM_TOKEN_URL);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");

                xhr.onreadystatechange = function () {
                    if (xhr.readyState < 4) {
                        return;
                    }

                    // response is complete check the status
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200 && xhr.status < 300) {
                            var response = xhr.responseText;
                            try {
                                var token = JSON.parse(response);
                                _setToken.call(self, token);
                                callback(null, token);
                            } catch (error) {
                                console.error(error.message);
                                callback(ERROR.AUTH_RESPONSE_ERR);
                            }
                        } else {
                            console.error(xhr.responseText);
                            callback(ERROR.GENERAL_ERR);
                        }
                    } else {
                        console.error(xhr.responseText);
                        callback(ERROR.GENERAL_ERR);
                    }
                };

                xhr.send(params);
            }

            if (error) {
                var cause = error[1];
                if (cause && cause.indexOf('access_denied') === 0) {
                    callback(ERROR.GRANT_PERMISSION_ERR);
                } else {
                    callback(ERROR.GENERAL_ERR);
                }
            }
        }

        function exitWindowListener(e) {
            authWindow.removeEventListener();
        }

        function loadErrorListener(e) {
            console.log("Unable to communicate with the server " + e);

            if (e.code === 400) {
                console.log("Unable to open the page...");
            }

            authWindow.close();
            callback(ERROR.COMMUNICATION_ERR);
        }

        function loadStopListener(e) {
            authWindow.show();
        }

        authWindow = window.open(url, '_blank', 'location=no,toolbar=no,hidden=yes');
        authWindow.addEventListener('loadstart', loadStartListener);
        authWindow.addEventListener('loaderror', loadErrorListener);
        authWindow.addEventListener('loadstop', loadStopListener);
        authWindow.addEventListener('exit', exitWindowListener);

        return authWindow;
    }

    OAuth.prototype = Object.create(ns.Auth.prototype);
    OAuth.prototype.constructor = OAuth;

    OAuth.prototype.authorize = _authorize;
    OAuth.prototype.logout = _logout;

    OAuth.ERROR_STATE = {
        /**
         * <code>COMMUNICATION_ERR</code> error can occur when there are issues connecting
         * to the OAuth server.
         */
        COMMUNICATION_ERR : 1,

        /**
         * <code>GRANT_PERMISSION_ERR</code> error can occur when the user denies access
         * to the profile information from the OAuth server.
         */
        GRANT_PERMISSION_ERR : 2,

        /**
         * <code>AUTH_RESPONSE_ERR</code> error can occur if the server's authorization response
         * can not be parsed into a valid format.
         */
        AUTH_RESPONSE_ERR : 3,

        /**
         * <code>GENERAL_ERR</code> error is a catch all error if something occurs which
         * is unknown.
         */
        GENERAL_ERR: 4
    };

    /**
     * Alias the ERROR STATE.
     * @private
     */
    var ERROR = OAuth.ERROR_STATE;

    ns.OAuth = OAuth;

})(cq.mobileapps.auth);;
;(function(ns, util, undefined) {
    'use strict';

    var LOGIN_URL = 'j_security_check',
        LOGOUT_URL = 'system/sling/logout';

    /**
     * Create a BasicAuth object to configure a basic authentication connection to the specified AEM server.
     *
     * @param {object} params
     * @param {string} params.server - the server to authenticate against
     * @param {string} params.username - the user's name
     * @param {string} params.password - the user's password
     * @param {string} params.token - an existing authentication token
     * @constructor
     */
    function BasicAuth(params) {
        if (!params.token) {
            if (!params.username) {
                throw Error("Missing mandatory username parameter");
            }
            if (!params.password) {
                throw Error("Missing mandatory password parameter");
            }
        }
        if (!params.server) {
            throw Error("Missing mandatory server parameter");
        }

        ns.Auth.call(this, params.server, params.token);

        if (params.resource) {
            this._resource = params.resource ? '?resource=' + params.resource : '';
        }

        this._username = params.username;
        this._password = params.password;
    }

    function _setToken(token) {
        /* jshint validthis: true */
        if (token) {
            if (typeof token === "object") {
                this.setToken(util.base64Encode(token.username + ':' + token.password));
            } else {
                this.setToken(token);
            }
        } else {
            this.setToken(null);
        }
    }

    /**
     * Authenticate against the server
     * @param callback
     * @private
     */
    function authorize(callback) {
        /* jshint validthis: true */
        var self = this,
            server = this.getServer(),
            data = cq.mobileapps.util.param({
                _charset_ : 'utf-8',
                j_validate: 'true',
                j_username: this._username,
                j_password: this._password
            });

        var xhr = new XMLHttpRequest();
        xhr.open("POST", server + LOGIN_URL);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");

        xhr.onreadystatechange = function () {

            if (xhr.readyState < 4) {
                // we're not ready yet
                return;
            }

            // response is complete check the status
            if (xhr.readyState === 4) {
                if (xhr.status === 200 && xhr.status < 300) {
                    _setToken.call(self, {
                        'username': self._username,
                        'password': self._password
                    });
                    callback(null);
                }
                else if (xhr.status === 403) {
                    callback(ERROR.ACCESS_DENIED);
                } else if (xhr.status === 0) {
                    // server could be shutdown or no network connection
                    callback(ERROR.COMMUNICATION_ERR);
                } else {
                    callback(ERROR.GENERAL_ERR);
                }
            }
        };

        xhr.send(data);
    }

    function logout(callback) {
        /* jshint validthis: true */
        var self = this;
        var url = this.getServer() + LOGOUT_URL + this._resource;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.onreadystatechange = function() {
            if (xhr.readyState < 4) {
                return;
            }

            // response is complete check the status
            if (xhr.readyState === 4) {
                if (xhr.status === 200 && xhr.status < 300) {
                    _setToken.call(self, null);
                    callback();
                } else {
                    callback(ERROR.LOGOUT_ERR);
                }
            }
        };

        xhr.send();
    }

    BasicAuth.prototype = Object.create(ns.Auth.prototype);
    BasicAuth.prototype.constructor = BasicAuth;

    BasicAuth.prototype.authorize = authorize;
    BasicAuth.prototype.logout = logout;

    BasicAuth.ERROR = {
        /**
         * <code>COMMUNICATION_ERR</code> error can occur when there are issues connecting
         * to the server.
         */
        COMMUNICATION_ERR : 1,

        /**
         * <code>ACCESS_DENIED</code> error can occur when the username or password are invalid.
         */
        ACCESS_DENIED : 2,

        /**
         * <code>GENERAL_ERR</code> error is a catch all error if something occurs which is unknown.
         */
        GENERAL_ERR: 3,

        /**
         * <code>LOGOUT_ERR</code> error is when there was an issue attempting to logout.
         */
        LOGOUT_ERR: 4,
    };

    /**
     * Alias the ERROR STATE.
     * @private
     */
    var ERROR = BasicAuth.ERROR;

    ns.BasicAuth = BasicAuth;

})(cq.mobileapps.auth, cq.mobileapps.util);;
;(function(window, ns, undefined) {
    'use strict';

    var targetLoadSuccessHandler = function(offer, callback) {
        var offerResult = ns.util.parse(offer);

        if (offerResult) {
            if (offerResult.defaultOffer === true) {
                // don't need to do anything the offer is the default offer
                if (callback && typeof callback === 'function') {
                    //console.log("default offer was issued");
                    callback(null);
                }
            } else {
                //console.log("Load custom offer from local file system: " + path);

                var self = this;
                cq.mobileapps.util.file.fetchHTML(offerResult.contentPath,
                    function (error, fragment) {
                        if (error) {
                            console.warn("Unable to load " + path);
                            callback(ERROR.UNABLE_TO_LOAD_CONTENT);
                            return;
                        }

                        if (self._el) {
                            while (self._el.firstChild) {
                                self._el.removeChild(self._el.firstChild);
                            }
                        }

                        var offerWrapper = document.createElement('div');
                        offerWrapper.innerHTML = fragment;
                        self._el.appendChild(offerWrapper);

                        if (callback && typeof callback === 'function') {
                            callback();
                        }

                    }
                );
            }
        } else {
            if (callback && typeof callback === 'function') {
                callback(ERROR.OFFER_PARSE_ERROR);
            }
        }
    };

    var targetLoadFailureHandler = function(callback) {
        if (callback && typeof callback === 'function') {
            callback(ERROR.TARGET_ERROR);
        }
    };

    /**
     * @classdesc The <code>Target</code> constructor.
     *
     * @param {string} mboxId - the id of the mbox
     * @param {string} el - the element in the dom which to insert the offer into.
     *
     * @class
     * @memberof cq.mobileapps.targeting
     */
    function Target(mboxId, el, mapping) {
        this._mboxId = mboxId;
        this._el = el;
        this._mapping = mapping;
    }

    /**
     * Sends request to Target and load the offer into the specified element.
     *
     * @param {object} parameters - the parameters to be sent to target
     * @param {function} callback - the callback is invoked when the call to target has been completed.  If there
     * is an error the callback will be called with an error code as the first argument.  If the call is successful
     * the callback's error will be undefined.
     *
     * @since 1.0
     */
    Target.prototype.targetLoadRequest = function(parameters, callback) {
        var self = this;
        if (this._mapping) {
            parameters = ns.util.map(this._mapping, parameters);
        }
        window.ADB.targetLoadRequest(
            function(offer) {
                targetLoadSuccessHandler.call(self, offer, callback);
            },
            function() {
                targetLoadFailureHandler.call(self, callback);
            },
            this._mboxId,
            null,
            parameters);
    };

    Target.ERROR = {
        /**
         * <code>TARGET_ERROR</code> can be caused when
         */
        TARGET_ERROR : 1,

        /**
         * <code>OFFER_PARSE_ERROR</code> is thrown when
         */
        OFFER_PARSE_ERROR: 2,

        /**
         * <code>UNABLE_TO_LOAD_CONTENT</code> can be thrown when the content being requested
         * doesn't exist on the device.
         */
        UNABLE_TO_LOAD_CONTENT: 3
    };

    /**
     * Alias the ERROR STATE.
     * @private
     */
    var ERROR = Target.ERROR;

    ns.Target = Target;

})(window, cq.mobileapps.targeting);;
/**
 * @namespace cq.mobileapps.targeting
 */
cq.mobileapps.targeting.util = (function(undefined) {
    'use strict';

    /**
     * Return an object that defines the content path and the mboxId associated with the offer if one exists.  If the
     * offer is the default offer, the property <code>defaultOffer</code> is set to true; otherwise it is false.
     *
     * If there was a problem parsing the response, null is returned.
     *
     * The format which are supported for parsing for offers are:
     *
     * <p>&lt;script type='text/javascript'&gt;CQ_Analytics.TestTarget.pull('{content.path}','{mbox.name}');&lt/script&gt;</p>
     *
     * and the case where the default offer is returned in the format of:
     *
     * <p>&lt;script type='text/javascript'&gt;CQ_Analytics.TestTarget.signalDefaultOffer('{mbox.name}');&lt/script&gt;</p>
     *
     * @param offer
     *
     * @return the offer if it contains a call back in the format of
     *
     * <pre>{{
     *  contentPath: string,
     *  mboxId: string,
     *  defaultOffer: false | true
     * }}
     * </pre>
     *
     *
     */
    function _parse(offer) {
        var regex = /pull\(\'(.+)',\'(.+)'\)\;/;
        var results = regex.exec(offer);

        if (!results || results.length !== 3) {

            // do we have a default offer?
            var defaultRegex = /signalDefaultOffer\(\'(.+)'\)/;
            var defaultResults = defaultRegex.exec(offer);

            if (defaultResults !== null) {
                return {
                    defaultOffer: true,
                    mboxId: defaultResults[1]
                };
            }

            return null;
        }

        return {
            defaultOffer: false,
            contentPath: results[1],
            mboxId: results[2]
        };

    }

    function _map(mapping, data) {
        var result = {};
        for (var prop in data) {
            var value,
                property;

            if (mapping.hasOwnProperty(prop)) {
                var obj = mapping[prop];
                if (typeof obj === 'object' &&
                    obj.property &&
                    obj.transformer &&
                    typeof obj.transformer === 'function') {

                    property = obj.property;
                    var transFunc = obj.transformer;
                    var rawValue = data[prop];
                    try {
                        value = transFunc(rawValue);
                    } catch(e) {
                        console.error("Transformer threw an error, going to continue... " + e);
                        continue;
                    }

                } else {
                    value = data[prop];
                    property = mapping[prop];
                }

                // add the property to the result
                Object.defineProperty(result, property, {
                    value: value + "",
                    writable: false,
                    enumerable: true
                });
            }
        }

        return result;

    }

    return {
        parse: _parse,
        map: _map
    };

})();;
;(function(ns, undefined) {

    "use strict";

    /**
     * @classdesc Base class for all providers.
     * @class
     * @memberof cq.mobileapps.provider
     * @since 1.0
     */
    function Provider() {

    }

    /**
     * @callback cq.mobileapps.Provider.fetch~fetchCallback
     * @typeof callback
     * @param {number} error - If an error occurs the value of error will be set
     * @param {object} data - the provider's data
     * @memberof cq.mobileapps.provider.Provider
     */

    /**
     * Abstract method that all provider need to implement.
     *
     * @abstract
     * @param {cq.mobileapps.provider.Provider~getCallback} callback - The callback function
     * @since 1.0
     */
    Provider.prototype.fetch = function(callback) {
        throw Error("The provider failed to implement fetch");
    };

    ns.Provider = Provider;


})(cq.mobileapps.provider);;
;(function(ns, undefined) {

    "use strict";

    /**
     * @classdesc Base class for all profile providers.
     * @class
     * @memberof cq.mobileapps.provider
     * @since 1.0
     */
    function ProfileProvider(auth) {
        var _auth = auth;

        this._getAuth = function() {
            return _auth;
        };
    }

    /**
     *
     * @abstract
     * @since 1.0
     */
    ProfileProvider.prototype.getAuth = function() {
        return this._getAuth();
    };

    ns.ProfileProvider = ProfileProvider;


})(cq.mobileapps.provider);;
;(function(ns, undefined) {

    "use strict";

    ns.ProfileProviderRegistry = (function() {

        var providers = [];

        return {

            register: function(provider) {
                providers.push(provider);
            },

            getProvider: function(auth) {
                for (var i = 0; providers.length; i++) {
                    var Provider = providers[i];
                    if (Provider.accepts(auth)) {
                        return new Provider(auth);
                    }
                }
                return null;
            }

        };

    })();

})(cq.mobileapps.provider);;
;(function(ns, undefined) {

    "use strict";

    var PROFILE_URL = 'libs/granite/security/currentuser.json?props=profile/*';

    /**
     * @classdesc BasicAuthUserProfileProvider provides information about the current user.
     * @class
     * @augments cq.mobileapps.provider.ProfileProvider
     * @memberof cq.mobileapps.provider
     * @since 1.0
     */
    function BasicAuthUserProfileProvider(auth) {
        ns.ProfileProvider.call(this, auth);
    }

    BasicAuthUserProfileProvider.prototype = Object.create(ns.ProfileProvider.prototype);
    BasicAuthUserProfileProvider.prototype.constructor = BasicAuthUserProfileProvider;

    /**
     * Retrieves the user profile information from the server.
     *
     * @override
     * @since 1.0
     */
    BasicAuthUserProfileProvider.prototype.fetch = function(callback) {
        if (!this.getAuth().getToken()) {
            throw Error("You must be authenticated priory to making a request");
        }

        var url = this.getAuth().getServer() + PROFILE_URL;

        var oReq = new XMLHttpRequest();
        oReq.open("GET", url);
        oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        oReq.setRequestHeader('Authorization', 'Basic ' + this.getAuth().getToken());

        oReq.addEventListener('load', function(e) {

            if (oReq.status !== 200) {
                if (oReq.status === 401) {
                    callback(ERROR.UNAUTHORIZED);
                } else {
                    callback(ERROR.PROFILE_ERROR);
                }
                return;
            }

            var profile,
                userProfile;

            if (typeof oReq.responseText === 'string') {
                profile = JSON.parse(oReq.responseText);
                userProfile = profile.profile;

                // if the profile property exists then use it otherwise return the raw result
                if (profile.hasOwnProperty('profile')) {
                    if (profile.hasOwnProperty('home') && !userProfile.hasOwnProperty('home')) {
                        // remap the home property to match that of the oauth path property to be
                        // consistent with the variable name
                        userProfile.path = profile.home + '/profile';
                    }
                }
            } else {
                console.log("Profile response was not text therefore we generated a profile error");
                callback(ERROR.PROFILE_ERROR);
            }

            callback(null, userProfile);
        });

        oReq.addEventListener('error', function(e) {
            console.log("Failed to request " + url, oReq.responseText);
            callback(ERROR.PROFILE_ERROR);
        });

        oReq.send();
    };

    BasicAuthUserProfileProvider.ERROR_STATE = {
        /**
         * <code>COMMUNICATION_ERR</code> error can occur when there are issues connecting
         * to the server.
         */
        COMMUNICATION_ERR : 1,

        /**
         * <code>PROFILE_ERROR</code> general error if and error occurs attempting to
         * retrieve the profile information.
         */
        PROFILE_ERROR : 2,

        /**
         * If the user has not been authorized to view the profile
         */
        UNAUTHORIZED: 3
    };

    BasicAuthUserProfileProvider.accepts = function(auth) {
        return (auth instanceof cq.mobileapps.auth.BasicAuth);
    };

    /**
     * Alias the ERROR STATE.
     * @private
     */
    var ERROR = BasicAuthUserProfileProvider.ERROR_STATE;

    ns.BasicAuthUserProfileProvider = BasicAuthUserProfileProvider;

    ns.ProfileProviderRegistry.register(BasicAuthUserProfileProvider);

})(cq.mobileapps.provider);;
;(function(ns, undefined) {

    "use strict";

    var PROFILE_URL = 'libs/oauth/profile';
    var SCOPE_PROFILE = 'profile';

    /**
     * @classdesc OAuthUserProfileProvider provides information about the current user.
     * @class
     * @augments cq.mobileapps.provider.Provider
     * @memberof cq.mobileapps.provider
     * @since 1.0
     */
    function OAuthUserProfileProvider(auth) {
        ns.ProfileProvider.call(this, auth);
    }

    OAuthUserProfileProvider.prototype = Object.create(ns.ProfileProvider.prototype);
    OAuthUserProfileProvider.prototype.constructor = OAuthUserProfileProvider;

    /**
     * Retrieves the user profile information from the oauth server.
     *
     * @override
     * @since 1.0
     */
    OAuthUserProfileProvider.prototype.fetch = function(callback) {
        if (!this.getAuth().getToken()) {
            throw Error("You must be authenticated priory to making a request");
        }

        var url = this.getAuth().getServer() + PROFILE_URL;

        var oReq = new XMLHttpRequest();
        oReq.open("GET", url);
        oReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        oReq.setRequestHeader('Authorization', 'Bearer ' + this.getAuth().getToken());

        oReq.addEventListener('load', function(e) {

            if (oReq.status !== 200) {
                if (oReq.status === 401) {
                    callback(ERROR.UNAUTHORIZED);
                } else {
                    callback(ERROR.PROFILE_ERROR);
                }
                return;
            }

            var profile;
            if (typeof oReq.responseText === 'string') {
                profile = JSON.parse(oReq.responseText);
            }
            callback(null, profile);
        });

        oReq.addEventListener('error', function(e) {
            console.log("Failed to request " + url, oReq.responseText);
            callback(ERROR.PROFILE_ERROR);
        });

        var params = cq.mobileapps.util.param({
            scope: SCOPE_PROFILE
        });

        oReq.send(params);
    };

    OAuthUserProfileProvider.ERROR_STATE = {
        /**
         * <code>COMMUNICATION_ERR</code> error can occur when there are issues connecting
         * to the server.
         */
        COMMUNICATION_ERR : 1,

        /**
         * <code>PROFILE_ERROR</code> general error if and error occurs attempting to
         * retrieve the profile information.
         */
        PROFILE_ERROR : 2,

        /**
         * If the user has not been authorized to view the profile
         */
        UNAUTHORIZED: 3
    };

    OAuthUserProfileProvider.accepts = function(auth) {
        return (auth instanceof cq.mobileapps.auth.OAuth);
    };

    /**
     * Alias the ERROR STATE.
     * @private
     */
    var ERROR = OAuthUserProfileProvider.ERROR_STATE;

    ns.OAuthUserProfileProvider = OAuthUserProfileProvider;

    ns.ProfileProviderRegistry.register(OAuthUserProfileProvider);

})(cq.mobileapps.provider);