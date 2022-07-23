if [ "$1" != "-dev" ]; then
  sdk/bin/linux/x64/scapp src/main.htm
else
  sdk/bin/linux/x64/scapp run-dev.html --debug
fi