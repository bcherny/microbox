#!/bin/bash

cd "$( dirname "${BASH_SOURCE[0]}" )"
sass --watch sass:css -r ./sass/__funcs/url64/url64.rb --style compressed