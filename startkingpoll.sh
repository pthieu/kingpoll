#!/bin/bash

#start mongod service
/usr/bin/mongod --config ~/www/kingpoll/mongodb.config --dbpath ~/www/db/ --fork --logpath ~/www/mongod.log

#Invoke the Forever module (to START our Node.js server).
NODE_ENV=production \
forever \
start \
-al forever.log \
-ao log/out.log \
-ae log/err.log \
~/www/kingpoll/app.js