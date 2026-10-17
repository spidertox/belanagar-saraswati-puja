#!/usr/bin/env bash
# Push this project to GitHub from Termux (works on any Linux/macOS shell too).
#
#   bash deploy.sh          first time: create the GitHub repo and push.
#                           later: commit your changes and push them.
#   bash deploy.sh env      print ADMIN_PASSWORD_HASH + SESSION_SECRET (for Vercel).
#   bash deploy.sh forget   delete the GitHub token saved on this phone.
#
# The token is used only for the push. It is never written into the repo or
# into the git remote URL. If you choose to save it, it is kept in
# ~/.config/belanagar-deploy/token (readable only by you).
#
# Optional environment variables (handy for automation): GITHUB_TOKEN,
# GH_REPO, GH_PRIVATE (true/false), GIT_NAME, GIT_EMAIL, DEPLOY_MESSAGE,
# and ADMIN_PASSWORD (for `env`).
set -euo pipefail
cd "$(dirname "$0")"

TOKEN_FILE="${HOME}/.config/belanagar-deploy/token"
CONF_FILE=".deploy.conf"
DEFAULT_REPO="belanagar-saraswati-puja"
CREATED_REPO=0

say()  { printf '%s\n' "$*"; }
die()  { printf '\n❌ %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "'$1' install nahi hai. Termux me ye chalao:  pkg install -y $2"; }

# ask VAR "question" [default]   (skipped when VAR is already set)
ask() {
  local var="$1" prompt="$2" def="${3:-}" reply
  if [ -n "${!var:-}" ]; then return 0; fi
  if [ -n "$def" ]; then
    read -r -p "$prompt [$def]: " reply
    reply="${reply:-$def}"
  else
    read -r -p "$prompt: " reply
  fi
  printf -v "$var" '%s' "$reply"
}

mode_env() {
  need node nodejs
  local pw="${ADMIN_PASSWORD:-}"
  if [ -z "$pw" ]; then
    read -r -s -p "Admin panel ka password chuno (kam se kam 8 akshar): " pw
    echo
  fi
  node scripts/generate-admin-hash.js "$pw"
  say "SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")"
  say ""
  say "Ye dono lines Vercel ke Environment Variables me daalo (NAAM = VALUE alag-alag)."
  say "Admin login par wahi password chalega jo abhi chuna."
}

case "${1:-}" in
  env)    mode_env; exit 0 ;;
  forget) rm -f "$TOKEN_FILE"; say "✅ Is phone se saved token hata diya."; exit 0 ;;
  ""|push) ;;
  *) die "Samajh nahi aaya: '$1'.  Ye chalao:  bash deploy.sh   |   bash deploy.sh env   |   bash deploy.sh forget" ;;
esac

need git git
need curl curl

# 1. GitHub token ------------------------------------------------------------
TOKEN="${GITHUB_TOKEN:-}"
TOKEN_FROM_FILE=0
if [ -z "$TOKEN" ] && [ -f "$TOKEN_FILE" ]; then
  TOKEN="$(cat "$TOKEN_FILE")"
  TOKEN_FROM_FILE=1
fi
if [ -z "$TOKEN" ]; then
  say "GitHub token chahiye (sirf ek baar banana hai). Is link ko browser me kholo:"
  say "  https://github.com/settings/tokens/new?scopes=repo&description=termux-deploy"
  say "Neeche 'Generate token' dabao, token copy karo aur yahan paste karo."
  read -r -s -p "Token (type karte waqt dikhega nahi): " TOKEN
  echo
fi
[ -n "$TOKEN" ] || die "Token khali hai."

API_STATUS=""
API_BODY=""
api() {  # api METHOD PATH [JSON_BODY]  ->  sets API_STATUS and API_BODY
  local method="$1" path="$2" body="${3:-}" out
  local args=(-sS --max-time 30 -X "$method" -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" -w $'\n%{http_code}')
  if [ -n "$body" ]; then args+=(-d "$body"); fi
  out="$(curl "${args[@]}" "https://api.github.com$path")" || return 1
  API_STATUS="${out##*$'\n'}"
  API_BODY="${out%$'\n'*}"
}
json_field() { printf '%s\n' "$2" | sed -n "s/.*\"$1\": *\"\([^\"]*\)\".*/\1/p" | head -n 1; }

api GET /user || die "GitHub se connect nahi ho paaya. Internet check karo."
[ "$API_STATUS" = "200" ] || die "Token sahi nahi hai ya expire ho gaya (GitHub: $API_STATUS). Naya token banao."
GH_USER="$(json_field login "$API_BODY")"
[ -n "$GH_USER" ] || die "GitHub username nahi mil paaya."
say "GitHub account: $GH_USER"

if [ "$TOKEN_FROM_FILE" = 0 ] && [ -z "${GITHUB_TOKEN:-}" ] && [ -t 0 ]; then
  read -r -p "Token is phone me save kar lu, taaki agli baar na puchna pade? [y/N]: " save
  case "${save:-n}" in
    y|Y)
      mkdir -p "$(dirname "$TOKEN_FILE")"
      ( umask 077; printf '%s' "$TOKEN" > "$TOKEN_FILE" )
      say "Saved. Hatana ho to:  bash deploy.sh forget" ;;
  esac
fi

# 2. Repo settings (remembered in .deploy.conf, which is git-ignored) --------
_env_repo="${GH_REPO:-}"
_env_private="${GH_PRIVATE:-}"
if [ -f "$CONF_FILE" ]; then . "./$CONF_FILE"; fi
if [ -n "$_env_repo" ]; then GH_REPO="$_env_repo"; fi        # values you pass in the command win over the saved ones
if [ -n "$_env_private" ]; then GH_PRIVATE="$_env_private"; fi
ask GH_REPO "GitHub repo ka naam" "$DEFAULT_REPO"
[[ "$GH_REPO" =~ ^[A-Za-z0-9._-]+$ ]] || die "Repo ke naam me sirf English akshar, number aur - _ . chalte hain."
if [ -z "${GH_PRIVATE:-}" ]; then
  read -r -p "Repo private rakhein? [Y/n]: " p
  case "${p:-y}" in n|N) GH_PRIVATE=false ;; *) GH_PRIVATE=true ;; esac
fi
case "$GH_PRIVATE" in true|false) ;; *) GH_PRIVATE=true ;; esac
printf 'GH_REPO=%s\nGH_PRIVATE=%s\n' "$GH_REPO" "$GH_PRIVATE" > "$CONF_FILE"

# 3. Git: init, identity, commit ---------------------------------------------
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  git init -q -b main 2>/dev/null || { git init -q; git checkout -q -b main; }
fi
if [ -z "$(git config user.name || true)" ]; then
  ask GIT_NAME "Commit me kaunsa naam dikhe" "$GH_USER"
  git config user.name "$GIT_NAME"
fi
if [ -z "$(git config user.email || true)" ]; then
  ask GIT_EMAIL "Commit ka email" "${GH_USER}@users.noreply.github.com"
  git config user.email "$GIT_EMAIL"
fi
grep -qxF "$CONF_FILE" .gitignore 2>/dev/null || printf '%s\n' "$CONF_FILE" >> .gitignore

# Older copies of this project had one serverless function per file in api/. Vercel's
# free plan allows only 12, so the whole API is now the single file api/router.js (its
# code lives in server/). Clear the old files out if an earlier copy is still lying
# around, otherwise the deploy fails again.
if [ -f api/router.js ]; then
  for legacy in api/_lib api/announcements api/audit api/auth api/donations api/events api/expenses api/gallery api/summary.js; do
    if [ -e "$legacy" ]; then
      rm -rf "$legacy"
      say "Purani API file hata di: $legacy"
    fi
  done
fi

git add -A
if [ "$(git diff --cached --name-only | grep -Ec '(^|/)\.env(\.local)?$' || true)" != "0" ]; then
  git reset -q
  die ".env file commit hone wali thi, isliye roka gaya. .gitignore check karo."
fi
if git diff --cached --quiet; then
  git rev-parse -q --verify HEAD >/dev/null || die "Commit karne ke liye koi file nahi mili."
  say "Naya badlav nahi mila. Jo pehle se commit hai wahi push hoga."
else
  git commit -q -m "${DEPLOY_MESSAGE:-Update $(date '+%Y-%m-%d %H:%M')}"
  say "Badlav commit ho gaye."
fi
git branch -M main

# 4. Make sure the GitHub repo exists ----------------------------------------
api GET "/repos/$GH_USER/$GH_REPO" || die "GitHub se connect nahi ho paaya."
case "$API_STATUS" in
  200) ;;
  404)
    say "GitHub par repo '$GH_REPO' ban rahi hai..."
    api POST /user/repos "{\"name\":\"$GH_REPO\",\"private\":$GH_PRIVATE,\"description\":\"Belanagar Saraswati Puja Samiti website\"}" \
      || die "Repo nahi ban paayi."
    case "$API_STATUS" in
      201) CREATED_REPO=1 ;;
      422) say "(Is naam ki repo pehle se hai, aage badhte hain.)" ;;
      *)   die "Repo banane me dikkat (GitHub: $API_STATUS): $(json_field message "$API_BODY")" ;;
    esac ;;
  *) die "Repo check karne me dikkat (GitHub: $API_STATUS): $(json_field message "$API_BODY")" ;;
esac

# 5. Push. The token reaches git through a throw-away credential helper that
#    reads it from the environment, so it is never stored in the remote URL,
#    in .git/config, or on disk. ------------------------------------------------
REMOTE_URL="https://github.com/$GH_USER/$GH_REPO.git"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

say "GitHub par bheja ja raha hai..."
DEPLOY_GH_USER="$GH_USER" DEPLOY_GH_TOKEN="$TOKEN" GIT_TERMINAL_PROMPT=0 \
  git -c credential.helper= \
      -c 'credential.helper=!f() { echo "username=$DEPLOY_GH_USER"; echo "password=$DEPLOY_GH_TOKEN"; }; f' \
      push -u origin main \
  || die "Push nahi hua. Check karo: token me 'repo' permission hai? Repo me pehle se koi alag files to nahi?"

say ""
say "✅ Code GitHub par pahunch gaya: https://github.com/$GH_USER/$GH_REPO"
if [ "$CREATED_REPO" = 1 ]; then
  cat <<EOF

Ab ek baar Vercel se jodo (free; uske baad har push par site khud update hogi):
  1. vercel.com par "Continue with GitHub" se login karo
  2. Add New > Project > "$GH_REPO" ke saamne Import
  3. Environment Variables me ye 4 daalo:
       TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, ADMIN_PASSWORD_HASH, SESSION_SECRET
     (hash aur secret ke liye:  bash deploy.sh env)
  4. Deploy dabao
Poori guide: TERMUX-DEPLOY.md
EOF
else
  say "Agar Vercel pehle se juda hai to 1-2 minute me site apne aap update ho jayegi."
fi
