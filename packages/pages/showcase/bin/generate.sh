#!/bin/bash

echo "running monorepo project showcase generation"
export ROOTDIR=$(npm prefix)

node -pe "
  const pkg = require('$(ROOTDIR)/package.json');
  [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})].join(' --external:')
"
