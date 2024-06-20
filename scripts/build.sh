#!/usr/bin/env bash

# CI/CD build script

# Fail on error
set -e

# Echo commands
set -x

# Set node options
export NODE_OPTIONS='--max-old-space-size=5120'

# Diagnostics
node --version
npm --version

# Install
[ ! -d "node_modules" ] && npm ci

# Build
npm run build:all

# Agent installer
pushd packages/agent
npm run package
npm run installer
ls -la dist
popd

# Lint
npm run lint
