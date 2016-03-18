/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // Project configuration.
    grunt.util.linefeed = '\n';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        modules: [],//to be filled in by build task
        dist: 'dist',
        filename: 'bse.ui',
        meta: {
            modules: 'angular.module("bse.ui", [<%= srcModules %>]);'
        },
        concat: {
            dist: {
                src: [], //src filled in by build task
                dest: '<%= dist %>/<%= filename %>-<%= pkg.version %>.js'
            }
        },
        uglify: {
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: '<%= dist %>/<%= filename %>-<%= pkg.version %>.min.js'
            }
        }
    });

    //Common ui.bootstrap module containing all modules for src and templates
    //findModule: Adds a given module to config
    var foundModules = {};
    function findModule(name) {
        if (foundModules[name]) {
            return;
        }
        foundModules[name] = true;
        function breakup(text, separator) {
            return text.replace(/[A-Z]/g, function (match) {
                return separator + match;
            });
        }
        function ucwords(text) {
            return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
                return $1.toUpperCase();
            });
        }
        function enquote(str) {
            return '"${str}"';
        }
        function enquoteUibDir(str) {
            return enquote('bse/${str}');
        }

        var module = {
            name: name,
            moduleName: enquote('bse.ui.${name}'),
            displayName: ucwords(breakup(name, ' ')),
            srcFiles: grunt.file.expand(['src/${name}/*.js', '!src/${name}/index.js']),
            cssFiles: grunt.file.expand('src/${name}/*.css'),
            tplFiles: grunt.file.expand('template/${name}/*.html'),
            //tpljsFiles: grunt.file.expand('template/${name}/*.html.js'),
            tplModules: grunt.file.expand('template/${name}/*.html').map(enquoteUibDir),
            dependencies: dependenciesForModule(name),
            //docs: {
            //    md: grunt.file.expand('src/${name}/docs/*.md')
            //      .map(grunt.file.read).map((str) => marked(str)).join('\n'),
            //    js: grunt.file.expand('src/${name}/docs/*.js')
            //      .map(grunt.file.read).join('\n'),
            //    html: grunt.file.expand('src/${name}/docs/*.html')
            //      .map(grunt.file.read).join('\n')
            //}
        };
        var styles = {
            css: [],
            js: []
        };
        //module.cssFiles.forEach(processCSS.bind(null, module.name, styles, true));
        //if (styles.css.length) {
        //    module.css = styles.css.join('\n');
        //    module.cssJs = styles.js.join('\n');
        //}

        module.dependencies.forEach(findModule);
        grunt.config('modules', grunt.config('modules').concat(module));
    }

    function dependenciesForModule(name) {
        var deps = [];
        grunt.file.expand('src/' + name + '/*.js')
        .map(grunt.file.read)
        .forEach(function (contents) {
            //Strategy: find where module is declared,
            //and from there get everything inside the [] and split them by comma
            var moduleDeclIndex = contents.indexOf('angular.module(');
            var depArrayStart = contents.indexOf('[', moduleDeclIndex);
            var depArrayEnd = contents.indexOf(']', depArrayStart);
            var dependencies = contents.substring(depArrayStart + 1, depArrayEnd);
            dependencies.split(',').forEach(function (dep) {
                if (dep.indexOf('bse.ui.') > -1) {
                    var depName = dep.trim().replace('bse.ui.', '').replace(/['"]/g, '');
                    if (deps.indexOf(depName) < 0) {
                        deps.push(depName);
                        //Get dependencies for this new dependency
                        deps = deps.concat(dependenciesForModule(depName));
                    }
                }
            });
        });
        return deps;
    }

    grunt.registerTask('dist', 'Override dist directory', function () {
        var dir = this.args[0];
        if (dir) { grunt.config('dist', dir); }
    });

    grunt.registerTask('build', 'Create bse.ui build files', function () {
        var _ = grunt.util._;

        if (this.args.length) {
            this.args.forEach(findModule);
            grunt.config('filename', grunt.config('filenamecustom'));
        } else {
            grunt.file.expand({
                filter: 'isDirectory', cwd: '.'
            }, 'src/*').forEach(function (dir) {
                findModule(dir.split('/')[1]);
            });
        }

        //If arguments define what modules to build, build those. Else, everything
        var modules = grunt.config('modules');
        grunt.config('srcModules', _.pluck(modules, 'moduleName'));


        var srcFiles = _.pluck(modules, 'srcFiles');
        //Set the concat task to concatenate the given src modules
        grunt.config('concat.dist.src', grunt.config('concat.dist.src')
                     .concat(srcFiles));

        grunt.task.run(['concat', 'uglify']);
        
    });
};