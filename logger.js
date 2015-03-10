'use strict';

/**
 * Logger
 *
 * wraps the good logger
 * adds the request id if possible
 **/

var getNamespace = require('continuation-local-storage').getNamespace;
var lodash = require('lodash');

module.exports = {
    log: function () {},
    info: function () {},
    warn: function () {},
    error: function () {},
    fatal: function () {}
};

module.exports.init = function initLogger(server) {
    ['info', 'warn', 'error', 'fatal'].forEach(function (type) {
        module.exports[type] = function (data) {
            var correlationId = getNamespace('correlation').get('correlationId');

            if (typeof data !== 'object') data = {
                message: data
            };
            server.log([type], lodash.extend({}, data, {
                correlationId: correlationId
            }));
        };
    });

    module.exports.log = module.exports.info;
};
