#!/usr/bin/env bash

bin=`dirname "$0"`
bin=`cd "$bin"; pwd`

${bin}/daemon.sh stop nuve
${bin}/daemon.sh stop mcu
${bin}/daemon.sh stop agent
${bin}/daemon.sh stop app

