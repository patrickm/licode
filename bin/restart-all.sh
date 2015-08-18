#!/usr/bin/env bash

bin=`dirname "$0"`
bin=`cd "$bin"; pwd`

${bin}/stop-all.sh
${bin}/start-all.sh

