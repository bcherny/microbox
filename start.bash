#!/bin/bash -x

clear

# start sass
stylus --watch stylud --out css &

# start coffee
coffee -cwo js coffee &