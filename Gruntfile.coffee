module.exports = (grunt) ->

  # Initialize the configuration.
  grunt.initConfig
    watch: 
      # cwd: "src"
      files: ['**/*.coffee']
      tasks: ['coffee']
      options: 
        debounceDelay: 500

    coffee: 
      to_js: 
        expand: true
        flatten: true
        cwd: "src"
        src: "**/*.coffee"
        dest: "dist"
        ext: ".js"

  # Load external Grunt task plugins.
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask "default", ["watch"]