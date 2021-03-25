module.exports = function (grunt) {
  // Load all of the tasks automatically with this single line of code.
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({

    // JS ..................................................................
    babel: {
      options: {
        sourceMap: true,
        presets: ['@babel/preset-env'],
      },
      dist: {
        files: {
          'build/fbquicknav.js': 'src/fbquicknav.js',
        },
      },
    },

    uglify: {
      options: {
        mangle: false,
      },
      my_target: {
        files: {
          'build/fbquicknav.min.js': ['build/fbquicknav.js'],
        },
      },
    },
  });

  grunt.registerTask('buildjs', ['babel', 'uglify']);
};
