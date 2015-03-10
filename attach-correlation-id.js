'use strict';

var uuid = require('uuid');
var createNamespace = require('continuation-local-storage').createNamespace;
var correlation = createNamespace('correlation');
var Promise = require('bluebird');
var patchBluebird = require('cls-bluebird');
patchBluebird(correlation);

/**
 * Attach uniq correlation id
 *
 * - attaches a unique correlation id
 * - patches Bluebird to support cls, see https://github.com/othiym23/cls-q (do not bind to more than one namespace)
 */

module.exports = {
    register: function (server, options, next) {
        server.ext('onRequest', function (req, reply) {
            correlation.run(function () {
                var correlationId = '';
                if (req.headers['correlation-id']) {
                    correlationId += req.headers['correlation-id'] + ':';
                }

                correlationId += process.argv[2] + '_' + uuid.v4();

                correlation.set('correlationId', correlationId);

                reply.continue();
            });
        });

        next();
    }
};

module.exports.register.attributes = {
    name: 'CorrelationId'
};
