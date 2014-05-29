module.exports = function(grunt) {
    'use strict';

    function loadConfig(path) {
        var glob = require('glob'),
            object = {},
            key;
        glob.sync('*', {cwd: path}).forEach(function(option) {
            key = option.replace(/\.js$/,'');
            object[key] = require(path + option);
        });
        return object;
    }

    var asset_version = new Date().getTime();

    var js_file_config = {
            '<%= build.dest %>/chrome/content/unmark.js': [
                '_tmp/<%= build.source %>/chrome/content/unmark.js'
            ],
            '<%= build.dest %>/chrome/content/neurotechnics.lib.js': [
                '_tmp/<%= build.source %>/chrome/content/neurotechnics.lib.js'
            ]
        };

    // Base Config
    var config = {

        pkg: grunt.file.readJSON('package.json'),

        build: {
            buildId: '<%= pkg.version %>.<%= grunt.template.today("yyyymmddHHMM") %>',
            temp: '_tmp',
            source: 'src',
            dest: 'dist/<%= build.buildId %>',
            dest_dev: 'dev',
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\r\n' +
                    '<%= pkg.homepage ? " * " + pkg.homepage + "\\r\\n" : "" %>' +
                    ' * Copyright © <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                    ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") + "\\r\\n" %> */\r\n'
        },

        sass: {
            dist: {
                options: {
                    style: 'expanded', //nested, compact, compressed, expanded
                    banner: '<%= build.banner %>'
                    //banner: '/*! <%= pkg.name %> - <%=pkg.url %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author.name %> */\n'
                },
                files: {
                    "<%= build.dest %>/skin/skin.css": "<%= build.source %>/skin/skin.scss",
                    "<%= build.dest %>/skin/options.css": "<%= build.source %>/skin/options.scss"
                }
            },
            dev: {
                options: {
                    style: 'expanded',
                    banner: '<%= build.banner %>'
                    //banner: '/*! <%= pkg.name %> - <%=pkg.url %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author.name %> */\n'
                },
                files: {
                    "<%= build.dest_dev %>/skin/skin.css": "<%= build.source %>/skin/skin.scss",
                    "<%= build.dest_dev %>/skin/options.css": "<%= build.source %>/skin/options.scss"
                }
            }
        },

        'string-replace': {
            dev: {
                files: {
                    '<%= build.temp %>/': ['<%= build.source %>/install.rdf', '<%= build.source %>/chrome/content/*.js']
                },
                options: {
                    replacements: [
                        { pattern: /\{\%PACKAGE_VERSION\%\}/ig, replacement: '<%= pkg.version %>' },
                        { pattern: /\{\%BUILD_NUMBER\%\}/ig,    replacement: '<%= grunt.template.today("yyyymmdd") %>' },
                        { pattern: /\{\%DEBUG_MODE\%\}/ig,      replacement: 'true' }
                    ]
                }
            },
            dist: {
                files: {
                    '<%= build.temp %>/': ['<%= build.source %>/install.rdf', '<%= build.source %>/chrome/content/*.js']
                },
                options: {
                    replacements: [
                        { pattern: /\{%PACKAGE_VERSION%\}/ig, replacement: '<%= pkg.version %>' },
                        { pattern: /\{%BUILD_NUMBER%\}/ig,    replacement: '<%= grunt.template.today("yyyymmdd") %>' },
                        { pattern: /\{%DEBUG_MODE%\}/ig,      replacement: 'false' }
                    ]
                }
            }
        },

        copy: {
            dist: {
                files: [
                    { expand: true, cwd: "<%= build.temp %>/<%= build.source %>/", src: ["**"], dest: "<%= build.dest %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["chrome/content/*.xul"], dest: "<%= build.dest %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["defaults/**"], dest: "<%= build.dest %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["locale/**"], dest: "<%= build.dest %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["skin/*.png"], dest: "<%= build.dest %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["*.manifest"], dest: "<%= build.dest %>/" }
                ]
            },
            dev: {
                files: [
                    { expand: true, cwd: "<%= build.temp %>/<%= build.source %>/", src: ["**"], dest: "<%= build.dest_dev %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["chrome/content/*.xul"], dest: "<%= build.dest_dev %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["defaults/**"], dest: "<%= build.dest_dev %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["locale/**"], dest: "<%= build.dest_dev %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["skin/*.png"], dest: "<%= build.dest_dev %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["*.manifest"], dest: "<%= build.dest_dev %>/" }
                ]
            }
        },

        clean: {
            temp: {
                options: { force: true },
                src: "<%= build.temp %>/**/*"
            },
            dev: {
                options: { force: true },
                src: ["<%= build.dest_dev %>/**/*", ]
            }
        },

        compress: {
            main: {
                options: {
                    mode: 'zip',
                    archive: 'dist/unmark@neurotechnics.com.<%=build.buildId%>.xpi'
                },
                files: [
                    { expand: true, cwd: '<%= build.dest %>/', src: ['**'], dest: '/' }
                ]
            }
        }

    };


    // Look for any option files inside of `/custom/grunt_tasks` folder.
    // The file name would be `sass.js` or `watch.js` etc
    // If found, extend and overwrite with custom one
    grunt.util._.extend(config, loadConfig('./custom/grunt_tasks/'));

    // Config the Options
    grunt.initConfig(config);

    // Load the Tasks
    require('load-grunt-tasks')(grunt);

    // Register Tasks
    grunt.registerTask('default', [ 'sass:dist', 'string-replace:dist', 'copy:dist', 'compress', 'clean:temp' ]); // Default Production Build

    grunt.registerTask('dev', [ 'clean:dev', 'sass:dev', 'string-replace:dev', 'copy:dev', 'clean:temp' ]);

};
