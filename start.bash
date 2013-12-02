#!/bin/bash -x

clear

# start sass
sass --watch sass:css -r ./sass/__funcs/url64/url64.rb --style compressed &

# start coffee
coffee -cwo js coffee &