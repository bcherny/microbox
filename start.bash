#!/bin/bash -x

clear

# start sass
stylus --watch stylus --out css &

# start coffee
coffee -cwo js coffee &