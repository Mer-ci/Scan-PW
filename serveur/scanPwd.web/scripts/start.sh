#!/bin/sh

################################################################################
# Version          : $Id: $
# Description      : demarrage du serveur utiliser par l'extension scanPwd
################################################################################
SERVER_NAME=serveur.js
SERVER_DIR=/opt/scanPwd.web/
SCRIPT_DIR=$SERVER_DIR"scripts/"
SERVER_COMPLETE_DIR=$SERVER_DIR"bin/"$SERVER_NAME
NODE_PORT=8080

if [ $# -eq 2 ]
then
    NODE_PORT=$2
fi

global_start()
{
	echo "DEMARRAGE DU SERVEUR ..."
	postgres_start
	node_start
}

postgres_start()
{
	echo "DEMARRAGE DE POSTGRES ..."
	sh $SCRIPT_DIR"check.sh" pCheck
        ret=$?
	case $ret in
        	0)
        		echo "postgres démarre ..."
			/etc/init.d/postgresql start
        	;;
        	1)
        		exit 1
        	;;
        	2)
        		echo "postgres déjà lancer"
        	;;
        	*)
        		echo "retour check inconnu"
			exit 1
        	;;
	esac
	echo "FIN D'INITIALISATION DE POSTGRES"
}

node_start()
{
	echo "DEMARRAGE DE NODE ..."
	sh $SCRIPT_DIR"check.sh" nCheck $NODE_PORT
	ret=$?
	case $ret in
		0)
			echo "node.js démmarre ..."
			# nohup "node" $SERVER_COMPLETE_DIR $NODE_PORT $
                        forever start $SERVER_COMPLETE_DIR $NODE_PORT
		;;
		1)
			exit 1
		;;
		2)
			echo "node.js déjà lancer"
		;;
		*)
			echo "retour de check inconnu ---> abandon"
			exit 1
		;;
	esac
}

case $1 in
	start)
		global_start
	;;
	sNode)
		postgres_start
	;;
	sPostgres)
		node_start
	;;
	-h)
	echo "permet de lancer le serveur scanPwd"
	echo "diférentes options sont possibles :"
	echo "avec option start (option par default) permet de lancer la routine de lancement du serveur"
	echo "avec option sNode permet de seulement démarrer node"
	echo "avec option sPostgres permet de seulment lancer postgres"
	echo ""
	echo "pour sélectionner un port spécifique (par default 8080) mettre le numéro de port en 2eme argnument"
	echo "exemple : start.sh start 8081"
	;;
	*)
	global_start
	;;
esac

exit 0
