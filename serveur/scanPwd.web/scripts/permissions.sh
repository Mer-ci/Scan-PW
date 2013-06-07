#!/bin/sh

################################################################################
# Version          : $Id: $
# Description      : gére les permissions
################################################################################

# permisions sur les scripts
sudo chown -R p1ext /opt/scanPwd.web/scripts/
sudo chmod -R 754 /opt/scanPwd.web/scripts/

# permisions sur les logs
sudo chown -R p1ext /opt/scanPwd.web/bin/log/
sudo chmod -R 744 /opt/scanPwd.web/bin/log/

# permissions sur le serveur
sudo chown p1ext /opt/scanPwd.web/bin/serveur.js
sudo chmod 744 /opt/scanPwd.web/bin/serveur.js
