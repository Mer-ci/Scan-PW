#SCAN PW

voir wiki : https://github.com/Mer-ci/Scan-PW/wiki

Scan pw a pour but de centraliser tous vos mots de passe sur votre mobile, cela permet de ne pas avoir à retenir les nombreux mots de passe que l'on utilise tous les jours (carte bleue, sites internet, boite mail …). La force de scan pw est d'utiliser des technologies novatrices permettant de retrouver rapidement vos mots de passe et de renseigner automatiquement les champs de logins sur tous vos sites. Scan pw est composé de trois parties: une application mobile (android), un serveur et une extension chrome.


		utilisateurs spéciaux


Il y a trois utilisateurs spéciaux :
-	p1ext : va permettre de gérer le serveur, il va pouvoir lancer les scripts de démarrage, d’arrêt, etc. Seules les personnes faisant partie du groupe de p1ext pourront se connecter grâce à :
sudo –u p1ext -i

-	postgres : permet d’administrer postgres, on ne peut se connecter avec qu’en passant par l’utilisateur « su ». Exemple : 
sudo su
su postgres
psql
	
-	scanpwd_postgres : utilisateur postgres qui va être utilisé par le serveur pour faire toutes les transactions dont il a besoin sur la base de données 4dory. Cet utilisateur aura seulement les droits UPDATE, SELECT, DELETE et insert sur la table templogins.


		installation du serveur


Commencer par installer node.js
	
sudo apt-get install python g++ make checkinstall
mkdir ~/src && cd $_
wget –N http://nodejs.org/dist/node-latest.tar.gz
tar xzvf node-latest.tar.gz && cd node-v*
./configure
sudo make install
		fichier serveur et installe de tous les modules nécessaires ( emplacement : /opt/scanPwd.web/bin)
Copier le fichier  « serveur.js » et installer : crypto, forever (install global : sudo npm install forever –g), node-bignumber, pg, querystring, request, url, winston.

Ne pas oublier le fichier log : touch /opt/scanPwd.web/bin/log/Logging.log 

Création de l’utilisateur p1ext qui sera utilisé pour lancer le serveur, on pourra se connecter à lui qu’en passant par l’utilisateur su.

sudo useradd p1ext
sudo passwd p1ext
si problème de shell regarder dans /,etc/passwd pour l’user si sh remplacer par bash

sudo usermod –a –G p1ext {user à ajouter}

sudo su
visudo
ajouter : %p1ext ALL = (p1ext) NOPASSWD: ALL
exit

sudo nano .bashrc
ajouter :alias sup1ext="sudo -u p1ext -i"

Mise en place des fichiers de scripts (emplacement : /opt/scanPwd.web/scripts ) 

Copier les fichiers start.sh, stop.sh, check.sh, permissions.sh
		
Ensuite installation de Postgres SQL

sudo apt-get install postgresql
sudo passwd postgres (pour permettre de se connecter en tant  que postgres)
Création de la table 
su postgres
createdb 4dory
pour plus de faciliter configurer postgres pour une connections externe grâce a pgadmin3
		modifier /etc/posctgresql/8.4/main/postgresql.conf -> listen_addresses = 'localhost, 10.11.1.104'
		modifier /etc/posctgresql/8.4/main/pg_hba.conf ajouter :
			host all all 10.10.0.0/24 trust
host all all {ip du serveur}/{masque de sous réseau} ident
host all all 10.10.0.101/24 trust
modifier :
local   all         all                               trust
host    all         all         127.0.0.1/32          trust
host    all         all         ::1/128               md5

Ajoutez la table templogins grâce au script suivant (qui va aussi créer l’user scanpwd_postgres)
-- Table: templogins  -- DROP TABLE templogins;  CREATE TABLE templogins (   dateajout date,   datecommobile date,   alea character varying(350),   clepub character varying(350),   usr character varying(512),   mdp character varying(512),   url character varying(255),   nbessai integer,   cancel boolean DEFAULT false,   id serial NOT NULL,   "isLogin" boolean DEFAULT false,   CONSTRAINT id PRIMARY KEY (id) ) WITH (   OIDS=FALSE ); ALTER TABLE templogins   OWNER TO postgres; GRANT ALL ON TABLE templogins TO postgres; CREATE USER scanpwd_postgres WITH PASSWORD 'sCanPw2-P'; GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE templogins TO scanpwd_postgres;  GRANT USAGE, SELECT ON SEQUENCE public.templogins_id_seq TO scanpwd_postgres;
 

Donnez les droits de connexion de postgres et rendre l’utilisateur postgres impossible de se connecter sans passer par l’utilisateur su.
Pour cela éditez /ect/postgres/{version}/main/pg_hba.conf
Commentez toutes les lignes sauf : 
host all scanpwd_postgres 10.10.0.0/24 trust
local   all         all                               ident
host    all         all         127.0.0.1/32          trust

(Tous les connections sur le réseau 10.0.0.0 seront acceptés pour scanpwd_postgres en trust, seul le serveur pourra se connecter en ident sur postgres.

passwd –l postgres (empeche la connexion par mdp et oblige la connexion a postgres à partir du root)
réversible avec passwd –u postgres

Lancer le serveur grâce au script start (voir utilisation des scripts)
	
