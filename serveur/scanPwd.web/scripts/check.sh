#!/bin/sh

################################################################################
# Version          : $Id: $
# Description      : check de lancement
################################################################################

DB_NAME=4dory
DOMAINE=localhost
USER=scanpwd_postgres 
PORT=5432
TABLE=templogins
NODE_PORT=8080
IP=$(ip addr show dev eth0 | sed -e's/^.*inet \([^ ]*\)\/.*$/\1/;t;d')

if [ $# -eq 2 ]
then
	NODE_PORT=$2
fi

global_check()
{
	echo "check global lancer ..."
	postgres_check
	node_check
}

node_check()
{
	echo "node check lancer ..."
	node --version >/dev/null
	ret=$?
	if [ $ret -ne 0 ]
 	then
		echo "erreur vérifier l'installation de node.js"
		exit 1
	fi
	#verification que le port du domaine [$DOMAIN_PORT] est libre
 	netstat -a | grep $NODE_PORT | grep LISTEN >/dev/null
 	ret=$?
 	if [ $ret -eq 0 ]
 	then
		echo "Le port $NODE_PORT est utilisé --> Abandon"
		exit 1
	fi
	#
	nc -z $IP 8080
	ret=$?
	if [ $ret -eq 0 ]
	then
		echo "le serveur tourne sur le port : "$NODE_PORT
		exit 2
	fi
}

postgres_check()
{
	echo "postgres check lancer ..."
	#echo "test si postgres est bien installer"
	#sudo service postgresql status 
	#ret=$?
	#if [ $ret -ne 0 ]
        #then
        #        echo "erreur postgres non installer"
        #        exit 1
        #fi
	echo "test connection à la db"
        psql -h $DOMAINE -U $USER -p $PORT $DB_NAME --command="SELECT version();" >/dev/null 2>&1
        ret=$?
        if [ $ret -eq 0 ]
        then
                echo "connection réussi"
                #exit 2
        fi
	echo "test si la base de donnée exist"
	if psql -U $USER $DB_NAME -c '\q' 2>&1; 
	then
   		echo "database ${DB_NAME} exists"
	else
		echo "la base de donnée ${DB_NAME}  éxiste pas"
		exit 1
	fi
	echo "test si la table $TABLE exist"
	psql -h $DOMAINE -U $USER -p $PORT $DB_NAME --command="SELECT count(*) FROM information_schema.tables WHERE table_name = '$TABLE';"
	ret=$?
	echo $ret
	#echo "verification que le port du domaine ["$DOMAIN_PORT"] est libre"
        #netstat -a | grep 5432 | grep LISTEN >/dev/null
        #ret=$?
        #if [ $ret -eq 0 ]
        #then
        #        echo "Le port du domaine ["$DOMAIN_PORT"] est utilisé --> Abandon"
        #        exit 1
        #fi
}

case $1 in
	check )
		global_check
		;;
	pCheck )
		postgres_check
		;;
	nCheck )
		node_check
		;;
	list )
		# ps -efl | grep $NODE_PORT | grep -v grep
		forever list
		;;
	-h )
		echo "permet de vérifier le fonctionnement du serveur"
        	echo "diférentes options sont possibles :"
        	echo "avec option check (option par default) permet de lancer la routine de check"
	        echo "avec option pCheck permet de seulement lancer un check sur postgres"
        	echo "avec option nCheck permet de seulment lancer un check sur node.js"
		echo "avec l'option list vous pouvez lister les serveurs lancé"
        	echo ""
        	echo "pour sélectionner un port spécifique (par default 8080) mettre le numéro de port en 2e"
        	echo "exemple : check.sh check 8081"
	;;
	* )
		global_check
		;;
esac

exit 0
