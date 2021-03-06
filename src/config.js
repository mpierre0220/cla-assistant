/**
 * Configuration Module
 *
 * @title config
 * @overview Configuration Module
 */
var path = require('path');
var console = require("console");

var    services = JSON.parse(process.env.VCAP_SERVICES);
var    url=services["mongodb-2.4"][0].credentials.url; 
console.log("url =  "+url);
//{
//			"gitclient":"xxx",
//			"gituser": "xxx",
//			"host":"xxx",
//			"protocol":"https"			
//}
var cla_data=require('../cla-assist-data.json');
module.exports = {
    server: { 
        github: {  
            // optional
            protocol: cla_data.protocol || 'https',
            host: process.env.GITHUB_HOST || 'github.com',
            api: process.env.GITHUB_API_HOST || 'api.github.com',
            enterprise: !!process.env.GITHUB_HOST, // flag enterprise version
            version: process.env.GITHUB_VERSION || '3.0.0',

            // required
            client: cla_data.gitclient,
            secret: process.env.gitsecret,

            // required
            user: cla_data.gituser,
            pass: process.env.gitpassword,

            token: process.env.GITHUB_TOKEN,

            user_scope: ['user:email'], 
            admin_scope: ['user:email', 'public_repo', 'repo:status', 'read:repo_hook', 'write:repo_hook', 'read:org', 'gist']
        },

        localport: process.env.VCAP_APP_PORT || 5000,

        always_recompile_sass: process.env.NODE_ENV === 'production' ? false : true,

        http: {
            protocol: cla_data.protocol || 'http',
            host: cla_data.host || 'cla-assistant.io',
            port: process.env.HOST_PORT
        },

        security: {
            sessionSecret: process.env.SESSION_SECRET || 'cla-assistant',
            cookieMaxAge: 60 * 60 * 1000
        },

        smtp: {
            enabled: !!process.env.SMTP_HOST,
            host: process.env.SMTP_HOST,
            secure: (!!process.env.SMTP_SSL && process.env.SMTP_SSL === 'true'),
            port: process.env.SMTP_PORT || 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            name: 'cla-assistant'
        },

        mongodb: {
            uri: url || process.env.MONGOLAB_URI
        },

        slack: {
            token: process.env.SLACK_TOKEN
        },

        slack_url: process.env.SLACK_URL,

        static: [
            path.join(__dirname, 'bower'),
            path.join(__dirname, 'client')
        ],

        api: [
            path.join(__dirname, 'server', 'api', '*.js')
        ],

        webhooks: [
            path.join(__dirname, 'server', 'webhooks', '*.js')
        ],

        documents: [
            path.join(__dirname, 'server', 'documents', '*.js')
        ],

        controller: [
            path.join(__dirname, 'server', 'controller', '!(default).js'),
            path.join(__dirname, 'server', 'controller', 'default.js')
        ],

        middleware: [
            path.join(__dirname, 'server', 'middleware', '*.js')
        ],

        passport: [
            path.join(__dirname, 'server', 'passports', '*.js')
        ]

    },

    client: {
        gacode: process.env.GACODE
    }

};
