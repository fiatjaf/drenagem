#!/usr/bin/env fish

set folder $argv[1]

find $folder -name '*.js' ! -name 'bundle.js' ! -path '*node_modules*' | entr browserifyinc -vd $folder'app.js' -o $folder'bundle.js'
