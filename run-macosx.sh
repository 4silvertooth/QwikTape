if [ "$1" != "-dev" ]; then
  sdk/bin/macosx/scapp src/main.htm
else
  sdk/bin/macosx/scapp run-dev.html --debug
fi