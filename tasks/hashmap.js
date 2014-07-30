/*
 * grunt-hash-map
 * https://github.com/Jwata/grunt-hash-map
 *
 * Copyright (c) 2014 Junji Watanabe
 * Licensed under the MIT license.
 */

function unixify(path) {
  return path.split('\\').join('/');
}

module.exports = function(grunt) {
  var path = require('path');
  var getHash = require('../lib/hash');

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('hashmap', 'Append a unique hash to tne end of a file for cache busting.', function() {
    var options = this.options({
        hashFunction: getHash,
    });

    var map = {};
    var mappingExt = path.extname(options.mapping);

    // If mapping file is a .json, read it and just override current modifications
    if (mappingExt === '.json' && grunt.file.exists(options.mapping)) {
      map = grunt.file.readJSON(options.mapping);
    }

    this.files.forEach(function(file) {
      file.src.forEach(function(src) {
        var source = grunt.file.read(src);
        var hash = options.hashFunction(source, 'utf8').substr(0, options.hashLength);
        var ext = path.extname(src);
        var relativePath = path.relative(options.srcBasePath, src);
        var key = relativePath.replace(ext, "");

        map[unixify(key)] = hash;
      });
    });

    var output = '';

    if (mappingExt === '.php') {
      output = "<?php return json_decode('" + JSON.stringify(map) + "'); ?>";
    } else {
      output = JSON.stringify(map, null, "  ");
    }

    grunt.file.write(options.mapping, output);
    grunt.log.writeln('Generated mapping: ' + options.mapping);

  });
};
