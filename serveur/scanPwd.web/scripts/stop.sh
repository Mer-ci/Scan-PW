#!/bin/sh

################################################################################
# Version          : $Id: $
# Description      : demarrage du serveur utiliser par l'extension scanPwd
################################################################################
NODE_PORT=8080

if [ $# -eq 2 ]
then
    NODE_PORT=$2
fi

global_stop()
{
	node_stop
}

node_stop()
{
	# sudo killall node
	# ps -efl | grep $NODE_PORT | grep -v grep | awk '{ print $4 }'| sudo xargs kill -9 
	forever list
	echo "qu'elle serveur voulez vous arréter ?"
	read num
	forever stop $num
}

postgres_stop()
{
	sudo service postgresql stop
}

case $1 in
	stop )
		global_stop
	;;
	pStop )
		# postgres_stop
	;;
	nStop )
		node_stop
	;;
	-h )
		echo "permet d'arréter le serveur scanPwd"
        	echo "diférentes options sont possibles :"
        	echo "renseigner l'option stop (par default) pour arréter le serveur"
		echo "l'option pStop permet d'arréter postgres"
		echo "l'option nStop permet d'arréter node.js"
         	echo ""
        	# echo "pour sélectionner un port spécifique (par default 8080) mettre le numéro de port en 2e"
        	# echo "exemple : stop.sh stop 8081"
	;;
	* )
		global_stop
		;;
esac

exit 0
