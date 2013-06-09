#SCAN PW

Scan pw a pour but de centraliser tous vos mots de passe sur votre mobile, cela permet de ne pas avoir à retenir les nombreux mots de passe que l'on utilise tous les jours (carte bleue, sites internet, boite mail …). La force de scan pw est d'utiliser des technologies novatrices permettant de retrouver rapidement vos mots de passe et de renseigner automatiquement les champs de logins sur tous vos sites. Scan pw est composé de trois parties: une application mobile (android), un serveur et une extension chrome.

	I application mobile

L'application mobile est le coeur de scan pw, elle va stocker tous vos mots de passe et vous permettre de les retrouver facilement le tout protégé par un mot de passe principal. 

	II extension chrome	

L'extension chrome va permettre de renseigner les identifiants quand ils seront demandés, pour cela l'extension va générer un QR Code que l'application mobile devra scanner puis elle enverra les identifiants correspondants à l'extension pour qu'elle puisse les rentrer dans les champs souhaités.

		II.1 menus de l’extension

Ces options sont :
-	L’affichage du QR Code avec redimensionnement, possibilité de désactiver l’affichage automatique de la popup, ainsi qu’un bouton d’aide ouvrant un nouvel onglet avec une page web contenant l’aide plus les infos de licence, etc.

![extension menu](/img/menuExtension.png "extension menu")


		II.2 Reconnaissance de la nécessité d’identifiants et génération de QRCode


L'extension parcourt chaque page et vérifie si elle nécessite des identifiants, si c'est le cas on génére un QRCode. La partie détection se trouve dans le content script pour avoir accès à la page web visitée. La détection automatique peut-être désactivée, si on la désactive on peut toujours afficher le QR Code en passant par le popup de l'extension. À noter que si les champs ne sont pas automatiquement détectés les identifiants peuvent être insérés grâce à un menu contextuel. Le QRCode peut être redimensionné pour faciliter le scan du QRCode, il contient : l'URL de la page et la clef publique.


		II.3 Fonctionnement interne 


L’extension est divisée en plusieurs fichiers en fonction des fonctionnalités de l’extension chrome. Les différents  fichiers ainsi que leurs fonctionnalités sont les suivants : 
-	popup.js : ce fichier JavaScript lié a une page « popup.html », mais la vue est générée par qrview.js. Ce pop-up permet d’afficher le QR Code si il ne s’affiche pas automatiquement.
-	qrview.js : permet de gérer l’affichage principal de l’extension ainsi que les interactions de l’utilisateur dessus, l’accès à l’aide et le paramétrage de plusieurs options comme le choix de la taille du QR Code, activer/désactiver l’affichage auto du QR.
-	background.js : fichier JavaScript lié à une page « background.html » pour la déclaration des fichiers externes. Ce fichier va permettre la communication entre les différents modules de l’extension et il va aussi faire les tâches de fond comme faire les appels serveur. Il est donc composé de listener, ainsi que l’implémentation des fonctions permettant de créer les menus contextuels.
-	content.js : fichier js qui sera exécuté au sein de la page charger dans le navigateur. Ce fichier aura pour fonction de détecter les champs de login, et d’insérer les logins dans ces champs. Si la détection automatique est activée, il va aussi afficher la vue principale (générer par qrview.js) directement dans la page du site visité
-	communication.js : fichier JavaScript qui aura pour but de communiquer avec le serveur.
-	crypto.js : fichier JavaScript qui s’occupera de la cryptographie : génération clé publique/privé, chiffrement/déchiffrement des données.
-	QRcode.js : fichier JavaScript qui va faire la génération du QR Code.

![extension operations](/img/extensionOperations.png "extension operations")


	III serveur


Le serveur est un intermédiaire entre l'extension et le mobile, car ils ne communiquent pas directement entre eux (une communication directe peut-être implémentée plus tard). Le serveur est fait en Node.js et utilise une base de données postgres.

		III.1 Fonctionnement du serveur

Le serveur.js peut être directement lancé grâce à la commande node, exemple : node serveur.js, ou en spécifiant le port en plus (par défaut 8080)  exemple : node serveur.js 8081.

Nous avons créé des scripts permettant de lancer plus simplement le serveur ainsi que lancer un certain nombre de check. Ces scripts sont stockés dans le répertoire  /var/scanPwd.web/scripts, nous avons trois scripts (voir partie utilisation des scripts).

Nous avons mis les logs dans le dossier /var/scanPwd.web/bin/log (les fichiers de logs peuvent évoluer en fonction des outils utilisés)

		III.2 Utilisation des scripts

Nous avons trois scripts stockés dans /var/scanPwd.web/scripts qui sont : 
-	start.sh qui permet de lancer le serveur node ainsi que postgres. Il peut avoir deux options, la première option peut être : start (lancement de la routine classique), sNode (démarre seulement node), sPostgres (lance seulement postgres). Le deuxième argument va permettre de spécifier un port exemple : start.sh start 8090, va lancer le serveur sur le port 8090.
-	stop.sh va permettre d’arrêter un serveur spécifié. Il peut avoir une option qui est : stop utiliser par défaut  va faire un arrêt classique du serveur, nStop va seulement arrêter node, et pStop qui va seulement arrêter postgres.
-	Check.sh, utilisa par start.sh pour faire les check, peut aussi être lancé seul pour permettre de voir l’état du serveur. Il possède deux options, la première permettant de choisir le mode : check pour lancer un check global, pCheck lance un check seulement sur postgres et nCheck qui permet de lancer un check sur node. Le deuxième argument permet comme dans start.sh de spécifier un port.


		III.3 utilisateurs spéciaux


Il y a trois utilisateurs spéciaux :
-	p1ext : va permettre de gérer le serveur, il va pouvoir lancer les scripts de démarrage, d’arrêt, etc. Seules les personnes faisant partie du groupe de p1ext pourront se connecter grâce à :
sudo –u p1ext -i

-	postgres : permet d’administrer postgres, on ne peut se connecter avec qu’en passant par l’utilisateur « su ». Exemple : 
sudo su
su postgres
psql
	
-	scanpwd_postgres : utilisateur postgres qui va être utilisé par le serveur pour faire toutes les transactions dont il a besoin sur la base de données 4dory. Cet utilisateur aura seulement les droits UPDATE, SELECT, DELETE et insert sur la table templogins.


		III.4 Installation du serveur


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
	
	IV Communications


		IV.1 PC - mobile

La communication entre le pc et le mobile se fait par QR Code, les informations passées seront (voir la partie trame) :

-	Clé publique 
-	URL


		IV.2 Mobile - serveur


La communication entre le mobile et le serveur est faite par une connexion en HTTP. Le mobile envoie les informations suivantes sous format JSON :

-	Clé publique (de la partie extension)
-	Données de login et URL encryptés grâce à la clé publique de la partie extension

Le mobile peut aussi arrêter une transaction en envoyant une trame de type : « type=c » au serveur.

		IV.3 PC - serveur

La communication se fera en utilisant HTTP de la façon suivante : les données seront envoyées dans un format JSON

À partir du moment qu’un QR code a été généré, l’extension va envoyer une requête sur le serveur contenant la clé publique -> à la réception de la requête on vérifie si la clé publique a une correspondance le serveur répond à l’extension en envoyant un aléa encrypté avec la clé publique de l’extension -> l’extension décrypte l’aléa avec sa clé privée et l’envoi en clair au serveur -> le serveur vérifie si l’aléa est identique si oui il envoie la donnée au PC *.

* À ce niveau-là, il y a une attente des informations envoyées par le mobile.

		IV.4 Codes d'actions

Ces codes vont permettre la communication avec le serveur :
-	Action = mdp : indique au serveur que l’extension fait une demande de mot de passe 
o	Réponse positive : code 200 -> alea chiffrés (JSON)
o	Réponse négative : Erreur 520 (voir partie Codes d’erreur)
-	Action = sAlea : indique au serveur que l’extension envoi l’aléa déchiffré 
o	Réponse positive : code 200 -> envois des identifiants + URL
o	Réponse négative : code 520, 521, 522, 523 (voir partie Codes d’erreur)
-	Action = r : indique au serveur que le mobile envoi les identifiants
o	Réponse positive : code 200 -> « success »
o	Réponse négative : Erreur 520 (voir partie Codes d’erreur)
-	Action = c : indique au serveur une commande cancel
o	Réponse positive : code 200 -> « success »
o	Réponse négative : Erreur 520 (voir partie Codes d’erreur)


		IV.5 Codes d'erreur


Codes d’erreur générer par le serveur :
-	Erreur 520 : problème avec la base de donnée -> retourne l’erreur générer par le module postgres.
-	Erreur 521 : demande d’un renvoi -> retourne « waitLogin »
-	Erreur 522 : temps d’attente des identifiants est trop long -> retourne « cancel »
-	Erreur 523 : identifiant demander à reçut un cancel.


	V Trames

	
		V.1 Entre l'extension et le mobile


Ici les informations sont envoyées par QR Code, nous avons donc choisi d’avoir une trame sous forme d’URL, pour rester cohérent avec la technologie QR Code, contenant l’URL que l’on tronque en enlevant les paramètres originaux, la clé publique sur 1024 bits et un code « d’action » qui sera « r ». Exemple : 

http://r.mer.ci?r&CCCFvggbzzscvrted542c45fv56CCCFvggbzzscvrted542c45fv56CCCFvggbzzscvrted542c45fv56CCCFvggbzzscvrted542c45fv56CCCFvggbzzscvrted542c45fv56CCCFvggbzzscvrted542c45fv56CCCFvggbzzscvrted542c45fv56CCCFvggbzzscvrted542c45fv5&www.amazon.fr


		V.2 Entre l'extension et le serveur

Les informations sont envoyées en JSON, les trames auront donc la forme suivante (nous nous plaçons du coter extension): 

-	envoi clé publique
{
	clé publique : « cle »
}

-	Réception aléa cryptée
{
	aléa : « aléa »
}
-	Envoi aléa décrypté
{
	aléa : « aléa »
}

-	réception des données
{
	URL : «  www.monUrl.com « ,
	userLogin : « user » ,
	userMdp : « mdp »
}


		V.3 Entre l'extension et le mobile


Les informations sont envoyées en JSON, les trames auront donc la forme suivante (nous nous plaçons du coter mobile): 

-	envoi des logins
{
	type : ‘r’,
	key : ‘the key’,
	URL : ‘www.mon-url.com’,
	login : ‘mon login’,
	pwd : ‘mon pwd’
}
-	envoi commande cancel
{
	type : ‘c’,
	key : ‘my key’
}



	VI Améliorations possibles


- utilisation des web sockets pour la communication
- utilisation du cryptage par courbes elliptiques qui aura comme principale avantage de réduire la taille des QR Code et de facilité le scan depuis le mobile.
- créer une connexion direct entre le mobile et l'extension pour éviter d'avoir à utiliser un serveur
- améliorer l'interface de l'extension
