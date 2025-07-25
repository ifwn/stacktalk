# Mudgate – SSO / QR‑Bridge Gateway

This droplet hosts **Keycloak** (SSO), the **QR‑bridge** FastAPI helper, and the front‑door **Nginx** config that secures every `*.bernard-labs.com` tool.

A vanilla DigitalOcean droplet cannot replace it without these steps.

---

## 1  Prerequisites on a fresh Ubuntu droplet (24.04 +) 

```bash
# packages + docker + git
sudo apt update && sudo apt install -y git nginx docker.io
sudo systemctl enable --now docker
```

Generate an SSH key on the droplet and add it as a **read‑only deploy key** in GitHub:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/mudgate-deploy -N "" -C "mudgate-deploy"
cat ~/.ssh/mudgate-deploy.pub   # paste into GitHub → repo → Settings → Deploy keys

echo '
Host github.com
    IdentityFile ~/.ssh/mudgate-deploy
    IdentitiesOnly yes
' | sudo tee -a /etc/ssh/ssh_config >/dev/null
```

---

## 2  Clone repo & bootstrap

```bash
sudo git clone git@github.com:ifwn/mudgate.git /opt/mudgate
cd /opt/mudgate
chmod +x deploy.sh
```

\### 2.1  Secrets files (never in Git)

| Path                    | Purpose                        |
| ----------------------- | ------------------------------ |
| `keycloak/secrets.env`  | KC\_DB\_URL, KC\_DB\_PASSWORD… |
| `qr-bridge/secrets.env` | REDIS\_HOST, REDIS\_PASSWORD…  |

Create them manually (samples below):

<details>
<summary><code>keycloak/secrets.env</code></summary>

```env
KC_DB=postgres
KC_DB_URL=jdbc:postgresql://<host>:25060/keycloak?sslmode=require
KC_DB_USERNAME=keycloak
KC_DB_PASSWORD=REPLACE_ME
KC_HOSTNAME=cloaking.bernard-labs.com
KC_HOSTNAME_STRICT=false
KC_PROXY=edge
KC_PROXY_HEADERS=xforwarded
KC_HTTP_ENABLED=true
```

</details>

<details>
<summary><code>qr-bridge/secrets.env</code></summary>

```env
REDIS_HOST=<redis-host>
REDIS_PORT=25061
REDIS_USERNAME=default
REDIS_PASSWORD=REPLACE_ME
REDIS_SSL=True
```

</details>

---

## 3  Nginx symlinks

```bash
sudo ln -sf /opt/mudgate/nginx/sites-available/bernard-labs \
            /etc/nginx/sites-available/bernard-labs
sudo ln -sf /etc/nginx/sites-available/bernard-labs \
            /etc/nginx/sites-enabled/bernard-labs

sudo ln -sf /opt/mudgate/nginx/snippets/ /etc/nginx/snippets/

sudo nginx -t && sudo systemctl reload nginx
```

*Wildcard cert must exist at*
`/etc/letsencrypt/live/bernard-labs.com/`.
Re‑issue with Certbot if the droplet is brand new.

---

## 4  Deploy / Update

\### Full‑stack deploy

```bash
/opt/mudgate/deploy.sh
```

\### Redeploy a single service

```bash
/opt/mudgate/deploy.sh qr-bridge   # or keycloak
```

---

## 5  Health checks

| Endpoint                                                        | Expected response                    |
| --------------------------------------------------------------- | ------------------------------------ |
| `https://cloaking.bernard-labs.com/`                            | Keycloak login page                  |
| `https://cloaking.bernard-labs.com/qr-login/`                   | `{"message":"QR Bridge is running"}` |
| `POST https://cloaking.bernard-labs.com/qr-login/qr-login-init` | `{"session_id":"uuid"}`              |

---

## 6  Re‑issuing wildcard SSL

```bash
sudo certbot certonly --manual --preferred-challenges dns \
     -d "*.bernard-labs.com" -d "bernard-labs.com"
sudo nginx -t && sudo systemctl reload nginx
```

---

## 7  Disaster‑recovery checklist

1. Provision new droplet, repeat **§1**.
2. Update DNS A‑record to new IP.
3. Follow **§2 → §6**.
4. Run `/opt/mudgate/deploy.sh`.

Total rebuild time ≈ **10 minutes**.

## 8  Updating code on the droplet (cheat-sheet)

sudo mkdir -p /root/.ssh
sudo chmod 700 /root/.ssh

cat <<'EOF' | sudo tee /root/.ssh/config >/dev/null
Host github.com
    IdentityFile /root/.ssh/mudgate-deploy
    IdentitiesOnly yes
EOF

sudo chmod 600 /root/.ssh/config
sudo chmod 600 /root/.ssh/mudgate-deploy     # key must be 600
mkdir keycloak # nothing in repo, so the directory will not be created

# first time clone
sudo ssh -T git@github.com # test for greeding
cd /opt
sudo git clone git@github.com:ifwn/mudgate.git mudgate

# lock in secerets file
sudo rsync -av /opt/mudgate/keycloak/secrets.env /opt/mudgate/qr-bridge/secrets.env /root/mudgate-secrets-backup/ 

# all commands run as root (or with sudo)
cd /opt/mudgate            # Git repo root
git pull --ff-only         # brings configs/scripts up to date
./deploy.sh                # pulls images, restarts containers, reloads Nginx


## APPENDIX A -- useful shit

# test the qr-bridge directly on mudgate -- this bypasses nginx, so helpful diagnosing.
# if this works, but the URL doesn't, then its an nginx problem
curl -v http://127.0.0.1:8000/qr-login/init -X POST

# this should be the same thing, but with the complete path
curl -k -v -X POST https://cloaking.bernard-labs.com/qr-login/init

# you can open a command line inside a container
docker exec -it qr-bridge /bin/sh


# If locked out of keycloak -- should be able to recover all from excel
-- set the browser_flow back to browser so it goes back to the default behavior (no problematic flow we created)

SELECT id, alias
  FROM authentication_flow
 WHERE alias = 'browser';
-- copy id

UPDATE realm
   SET browser_flow = 'faabb8c9-fbd8-4ee4-938a-1b8d98e84047' -- copied ID
 WHERE name  = 'master';

then, on mudgate
docker restart mudgate-keycloak-1




## APPENDIX B -- saved from terminal

root@mudgate:~# sudo apt update
Hit:1 http://mirrors.digitalocean.com/ubuntu oracular InRelease
Hit:2 http://mirrors.digitalocean.com/ubuntu oracular-updates InRelease
Hit:3 https://repos-droplet.digitalocean.com/apt/droplet-agent main InRelease
Hit:4 http://mirrors.digitalocean.com/ubuntu oracular-backports InRelease
Hit:5 http://security.ubuntu.com/ubuntu oracular-security InRelease
All packages are up to date.
root@mudgate:~# sudo apt install -y git
git is already the newest version (1:2.45.2-1ubuntu1.2).
git set to manually installed.
Summary:
  Upgrading: 0, Installing: 0, Removing: 0, Not Upgrading: 0
root@mudgate:~# git --version
git version 2.45.2
root@mudgate:~# ssh-keygen -t ed25519 -f ~/.ssh/mudgate-deploy -C "mudgate-deploy" -N ""
Generating public/private ed25519 key pair.
Your identification has been saved in /root/.ssh/mudgate-deploy
Your public key has been saved in /root/.ssh/mudgate-deploy.pub
The key fingerprint is:
SHA256:VkiE5HZNuurS+B11WJKbUv1dzr1q4yu/Q2oCC5rE+JI mudgate-deploy
The key's randomart image is:
+--[ED25519 256]--+
|     ..oo .      |
|     ... = o     |
|      o + * o   .|
|     . . + * . +o|
|  o     S = . . =|
| . o . + o . .  .|
|  + ooo +   o  . |
| E +o..o o + +.  |
|  .  oo . o =*=  |
+----[SHA256]-----+
root@mudgate:~# cat ~/.ssh/mudgate-deploy.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFv7MSMInIpg9+WC5q+qQAvnEKSimjhKDVngoSPik18j mudgate-deploy




sudo tee /usr/local/bin/deploy-bridge >/dev/null <<'EOS'
#!/usr/bin/env bash
# One-liner: redeploy only the QR-bridge container on Mudgate.
exec /opt/mudgate/deploy.sh qr-bridge
EOS
sudo chmod +x /usr/local/bin/deploy-bridge




sudo tee /usr/local/bin/deploy >/dev/null <<'EOS'
#!/usr/bin/env bash
# One-liner: Mudgate full redeploy.
/opt/mudgate/deploy.sh
EOS
sudo chmod +x /usr/local/bin/deploy


