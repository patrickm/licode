#!/usr/bin/env bash

bin=`dirname "$0"`
bin=`cd "$bin"; pwd`

${bin}/daemon.sh start nuve
${bin}/daemon.sh start mcu
${bin}/daemon.sh start agent
${bin}/daemon.sh start app

