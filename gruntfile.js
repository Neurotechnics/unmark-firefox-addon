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

    var js_file_config = {
            '<%= build.dest %>/chrome/content/unmark.js': [
                '<%= build.source %>/chrome/content/unmark.js'
            ]
        };

    // Base Config
    var config = {

        pkg: grunt.file.readJSON('package.json'),

        build: {
            temp: '_temp',
            source: 'src',
            dest: 'dist/<%= grunt.template.today("yyyymmddHHMM") %>'
        },

        sass: {
            dist: {
                options: {
                    style: 'compressed',
                    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                            '<%= grunt.template.today("yyyy-mm-dd") +"\\r\\n" %>' +
                            '<%= pkg.homepage ? " * " + pkg.homepage + "\\r\\n" : "" %>' +
                            ' * Copyright © <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") + "\\r\\n" %> */'
                    //banner: '/*! <%= pkg.name %> - <%=pkg.url %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author.name %> */\n'
                },
                files: {
                    "<%= build.dest %>/skin/skin.css": "<%= build.source %>/skin/skin.css"
                }
            }
        },

        mincss: {
            dist: {
                files: {
                    "<%= build.temp %>/skin/skin.css": ["<%= build.source %>/skin/skin.css"]
                }
            }
        },

        uglify: {
            dist: {
                options : {
                    beautify : {
                        ascii_only : true
                    },
                    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                            '<%= grunt.template.today("yyyy-mm-dd") +"\\r\\n" %>' +
                            '<%= pkg.homepage ? " * " + pkg.homepage + "\\r\\n" : "" %>' +
                            ' * Copyright © <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") + "\\r\\n" %> */'
                    //banner: '/*! <%= pkg.name %> - <%=pkg.url %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author.name %> */\n'
                },
                files: js_file_config
            }
        },

        concat: {
            dev: {
                options: {
                    stripBanners: false,
                    banner: '/*! DEVELOPMENT VERSION */ \n'
                },
                files: js_file_config
            }
        },

        watch: {
            scripts: {
                files: ['<%= build.source %>/chrome/content/*.js'],
                tasks: ['concat:dev', 'concat:custom']
            },
            css: {
                files: ['<%= build.source %>/skin/*.scss'],
                tasks: ['sass:prod']
            }
        },

        copy: {
            dist: {
                files: [
                    { expand: true, cwd: "<%= build.source %>/", src: ["chrome/content/*.xul"], dest: "<%= build.dest %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["defaults/**"], dest: "<%= build.dest %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["locale/**"], dest: "<%= build.dest %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["skin/*.png"], dest: "<%= build.dest %>/" },
                    { expand: true, cwd: "<%= build.source %>/", src: ["*.manifest", "*.rdf"], dest: "<%= build.dest %>/" }
                ]
            }
        },

        clean: {
            folder: "<config:build.temp>"
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
    grunt.registerTask('default', [ 'sass:dist', 'uglify:dist', 'copy:dist' ]); // Default Production Build

    grunt.registerTask('dev', [ 'clean', 'sass:dist', 'concat:dev', 'copy:dist' ]);

};
