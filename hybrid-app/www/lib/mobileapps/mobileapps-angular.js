/**
 * Adobe CQ Mobile Apps module
 *
 * @description
 * This module provides access to the AEM Apps mobile SDK from within an angular application.
 *
 */
(function(angular, cq, undefined) {

    'use strict';

    /**
     * Targeting Directive
     *
     * @name mobileapps.directive:cqTargeting
     *
     * @requires mobileapps.TargetService
     *
     * @restrict A
     *
     * @description
     *
     */
    $TargetingDirective.$inject = ['$ionicLoading', 'TargetService'];
    function $TargetingDirective($ionicLoading, TargetService) {

        return {
            restrict: 'A',
            scope: {
                mboxId: '@mboxid'
            },
            link: function(scope, element, attr) {

                document.removeEventListener( 'deviceready', doTarget );
                document.addEventListener( 'deviceready', doTarget, false );

                TargetService.on("target:dataChange", scope, doTarget);

                function doTarget() {
                    if (TargetService.available()) {
                        $ionicLoading.show({
                            hideOnStateChange: true
                        });
                        TargetService.updateOffer(scope.mboxId, element[0])
                            .then(function() {
                                console.log("Offer updated");
                            }, function() {
                                console.log("Offer not updated");
                            })
                            .finally(function() {
                                $ionicLoading.hide();
                            });
                    }
                }

            }
        };
    }

    /**
     * Target Service for interacting with AEM
     *
     * @name cqMobileApps.TargetService
     *
     */
    $TargetService.$inject = ['$q', '$rootScope'];
    function $TargetService($q, $rootScope) {
        var targetData = null,
            targetMapping = null,
            targeting = false,
            listeners = [
                'target:dataChange'
            ],
            targetQueue = [];

        function _isTargetAvailable() {
            return (cq.mobileapps.targeting.Target !== null);
        }

        function _processTargetQueue() {
            if (targeting) return;

            var obj = targetQueue.pop();
            var self = this;

            if (!obj) return;

            if (!_isTargetAvailable()) {
                obj.deferred.reject("ERROR: Target SDK not found.");
            } else {
                if (!obj.mboxid) {
                    obj.deferred.reject("mbox ID not defined.");
                }

                targeting = true;
                var mboxId = obj.mboxid

                console.log("Calling target: " + mboxId);
                var target = new cq.mobileapps.targeting.Target(mboxId, obj.element, this.getMapping());
                target.targetLoadRequest(this.getData(), function(error){
                    targeting = false;
                    if (error === null) {
                        obj.deferred.resolve();
                    } else {
                        obj.deferred.reject(error);
                    }
                    _processTargetQueue.call(self);
                });

            }
        }

        return {
            getData: function() {
                return targetData;
            },
            setData: function(data) {
                targetData = data;
                $rootScope.$emit('target:dataChange', data);
            },
            getMapping: function() {
                return targetMapping || {};
            },
            setMapping: function(mapping) {
              targetMapping = mapping;
            },
            available: function () {
                return _isTargetAvailable();
            },
            updateOffer: function(mboxid, element) {
                var deferred = $q.defer();
                targetQueue.push({mboxid:mboxid,element:element,deferred:deferred});
                _processTargetQueue.call(this);
                return deferred.promise;
            },
            on: function(event, scope, callback) {
                if(listeners.indexOf(event) === -1) {
                    throw "Unknown event '" + event + "'";
                }
                if(!angular.isFunction(callback)) {
                    throw "Callback must be a function.";
                }
                var handler = $rootScope.$on(event, callback);
                scope.$on('$destroy', handler);
            }
        };
    }

    angular.module('cqMobileApps', [])
        .directive('cqTargeting', $TargetingDirective)
        .factory('TargetService', $TargetService);

})(angular, cq);
