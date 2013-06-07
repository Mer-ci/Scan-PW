SCAN PW

scan pw à pour but de centraliser tous vos mot de passes sur votre mobile, cela permet de ne pas avoir à retenir les nombreux mots de passe que l'on utilise tous les jours (carte bleue, sites internet, boite mail …). La force de scan pw est d'utiliser des technologies novatrices permettant de retrouver rapidement vos mots de passe voir de renseigner automatiquement les champs de logins sur tous vos sites. Scan pw est composer de trois parties: une application mobile (android), une extension chrome, et un serveur.

I application mobile

L'application mobile est le coeur de scan pw, elle va stockée tous vos mots de passes et vous permettre de les retrouver facilement le tout protéger par un mot de passe principale. 

II extension chrome

L'extension chrome va permettre de renseigner les identifiants quand ils seront demander, pour cela l'extension va générer un QR Code que l'application mobile devra scanner puis elle enverra les identifiants correspondants à l'extension pour qu'elle puisse les rentrés dans les champs souhaité.

	II.1 Menus de l’extension
Ces options sont :-	L’affichage du QR Code avec redimensionnement, possibilité de désactiver l’affichage automatique de la popup, ainsi qu’un bouton d’aide ouvrant un nouvel onglet avec une page web contenant l’aide plus les infos de licence etc. ![extension menu](/img/menuExtension.png "extension menu")

	II.2 Reconnaissance de la nécessité d’identifiants et génération de QRCode

L'extension parcoure chaque page et vérifie si elle nécessite des identifiants, si c'est le ças on générer un QRCode. La partie détection se trouve dans le content script pour avoir accès à la page web visitée. La détection automatique peut être désactivée, si on la désactive on peut toujours afficher le QR Code en passant par le popup de l'extension. A noter que si les champs ne sont pas automatiquement détecter les identifiants peuvent être insérés grâce à un menu contextuel. Le QRCode peut être redimensionner pour faciliter le scan du QRCode, il contient : l'url de la page et la clef publique.	II.3 Fonctionnement interne 
L’extension est divisée en plusieurs fichiers en fonction des fonctionnalités de l’extension chrome. Les différents  fichiers ainsi que leurs fonctionnalités sont les suivants : -	popup.js : ce fichier JavaScript lié a une page « popup.html », mais la vue est générer par qrview.js. Ce pop-up permet d’afficher le QR Code si il ne s’affiche pas automatiquement.-	qrview.js : permet de gérer l’affichage principale de l’extension ainsi que les interactions de l’utilisateur dessus, l’accès à l’aide et le paramétrage de plusieurs options comme le choix de la taille du QR Code, activer/désactiver l’affichage auto du QR.-	background.js : fichier JavaScript lié a une page « background.html » pour la déclaration des fichiers externes. Ce fichier va permettre la communication entre les différents modules de l’extension et il va aussi faire les tâches de fond comme faire les appelles serveurs. Il est donc composé de listener, ainsi que l’implémentation des fonctions permettant de créer les menus contextuels.-	content.js : fichier js qui sera exécuter au sein de la page charger dans le navigateur. Ce fichier aura pour fonction de détecter les champs de login, et d’insérer les login dans ces champs. Si la détection automatique est activé il va aussi afficher la vue principale (générer par qrview.js) directement dans la page du site visité-	communication.js : fichier JavaScript qui aura pour but de communiquer avec le serveur.-	crypto.js : fichier JavaScript qui s’occupera de la cryptographie : génération clé publique/privé, chiffrement/déchiffrement des données.-	QRcode.js : fichier JavaScript qui va faire la génération du QR Code.
 ![extension operations](/img/extensionOperations "extension operations")
