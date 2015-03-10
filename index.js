'use strict';

var getNamespace = require('continuation-local-storage').getNamespace;
var request = require('request');
var Promise = require('bluebird');
Promise.promisifyAll(request);

var hapi = require('hapi');
var server = new hapi.Server();
var logger = require('./logger');
logger.init(server);

server.connection({
    port: process.argv[3]
});

server.register(require('./attach-correlation-id'), function (err) {
    if (err) console.error(err);
});

server.register({
    register: require('good'),
    options: {
        reporters: [{
            reporter: require('good-console'),
            args: [{
                log: '*',
            }]
        }]
    }
}, function (err) {
    if (err) console.error(err);
});

server.route([{
    method: 'GET',
    path: '/',
    config: {
        handler: function (req, reply) {
            logger.log('request');

            if (process.argv[4]) {
                var correlationId = getNamespace('correlation').get('correlationId');

                return request.getAsync({
                    url: 'http://0.0.0.0:' + process.argv[4],
                    headers: {
                        'correlation-id': correlationId
                    }
                }).spread(function (response, body) {
                    reply(body);
                }).catch(reply);
            };

            reply({
                status: 'ok'
            });
        }
    }
}]);

server.start(function (err) {
    if (err) return console.error(err);

    console.log('server started at ' + process.argv[3]);
});
