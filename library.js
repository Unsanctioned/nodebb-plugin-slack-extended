(function(module) {
    'use strict';

    var pluginData = require('./plugin.json');
    var User = require.main.require('./src/user');
    var Topics = require.main.require('./src/topics');
    var Categories = require.main.require('./src/categories');
    var meta = require.main.require('./src/meta');
    var winston = require.main.require('winston');
    var nconf = require.main.require('nconf');
    var async = require.main.require('async');
    var SlackClient = require('slack-node');
    var slack = null;

    pluginData.nbbId = pluginData.id.replace(/nodebb-plugin-/, '');

    var constants = Object.freeze({
            name : 'slack',
            admin: {
                icon  : 'fa-slack',
                route : '/plugins/' + pluginData.nbbId,
                label : 'Slack'
            }
        });

    var Slack = {
            config: {
                'webhookURL': '',
                'channel': '',
                'post:maxlength': '',
                'slack:categories': '',
                'topicsOnly': ''
            },
            nbbId: pluginData.nbbId
        };

    Slack.render = function(req, res, next) {
        res.render('admin/plugins/' + pluginData.nbbId, pluginData || {});
    }

    Slack.init = function(params, callback) {
        //params.router.get('/admin/plugins/slack', params.middleware.admin.buildHeader, render);
        //params.router.get('/api/admin/plugins/slack', render);

        params.router.get('/admin/plugins/' + pluginData.nbbId, params.middleware.admin.buildHeader, Slack.render);
        params.router.get('/api/admin/plugins/' + pluginData.nbbId, Slack.render);

        meta.settings.get('slack', function(err, settings) {
            for(var prop in Slack.config) {
                if (settings.hasOwnProperty(prop)) {
                    Slack.config[prop] = settings[prop];
                }
            }

            slack = new SlackClient();
            slack.setWebhook(Slack.config['webhookURL']);
        });

        winston.info('[plugins/' + pluginData.nbbId + '] Settings loaded');
        callback();
    },

    Slack.postSave = function(post) {
        post = post.post;
        var topicsOnly = Slack.config['topicsOnly'] || 'off';

        if (topicsOnly === 'off' || (topicsOnly === 'on' && post.isMain)) {
            var content = post.content;

            async.parallel({
                user: function(callback) {
                    User.getUserFields(post.uid, ['username', 'picture'], callback);
                },
                topic: function(callback) {
                    Topics.getTopicFields(post.tid, ['title', 'slug'], callback);
                },
                category: function(callback) {
                    Categories.getCategoryFields(post.cid, ['name'], callback);
                }
            }, function(err, data) {
                var categories = JSON.parse(Slack.config['slack:categories']);

                if (!categories || categories.indexOf(String(post.cid)) >= 0) {
                    // trim message based on config option
                    var maxContentLength = Slack.config['post:maxlength'] || false;
                    if (maxContentLength && content.length > maxContentLength) { content = content.substring(0, maxContentLength) + '...'; }
                    // message format: <username> posted [<categoryname> : <topicname>]\n <message>
                    var message = '<' + nconf.get('url') + '/topic/' + data.topic.slug + '|[' + data.category.name + ': ' + data.topic.title + ']>\n' + content;

                    slack.webhook({
                        'text'     : message,
                        'channel'  : (Slack.config['channel'] || '#general'),
                        'username' : data.user.username,
                        'icon_url' : data.user.picture.match(/^\/\//) ? 'http:' + data.user.picture : data.user.picture
                    }, function(err, response) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        }
    },

    Slack.adminMenu = function(headers, callback) {
        headers.plugins.push({
            'route' : constants.admin.route,
            'icon'  : constants.admin.icon,
            'name'  : constants.admin.label
        });
        callback(null, headers);
    }

    module.exports = Slack;

}(module));
