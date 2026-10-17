# Termux se GitHub par deploy

**Kaise chalta hai:** Termux se code GitHub par jaata hai, aur Vercel (free) GitHub se code leke site
khud bana kar chala deta hai. Jab bhi `bash deploy.sh` chalaoge, site apne aap update ho jayegi.

> **GitHub Pages kyun nahi?** Pages sirf static pages chalata hai. Is site ka admin panel aur
> daan/kharch ka data `api/` folder ke serverless functions se chalta hai, jo Pages par nahi chal
> sakte. Vercel site aur api dono chala deta hai.

## 1. Termux me ek baar setup

```bash
pkg update -y && pkg install -y git curl unzip nodejs
termux-setup-storage        # "Allow" dabao
```

## 2. Project kholo

```bash
cd ~ && unzip -o ~/storage/downloads/belanagar-saraswati-puja.zip && cd belanagar-saraswati-puja
```

(Zip kisi aur folder me ho to path badal do.)

## 3. GitHub par bhejo

```bash
bash deploy.sh
```

- Pehli baar token maangega. Is link ko browser me kholo:
  `https://github.com/settings/tokens/new?scopes=repo&description=termux-deploy`
  neeche **Generate token** dabao, token copy karo aur Termux me paste karke Enter dabao
  (paste karte waqt screen par kuch dikhega nahi, ye normal hai).
- Script khud repo bana degi (default **private**) aur code push kar degi.
- "Token save kar lu?" par `y` dabaoge to agli baar nahi puchega. Hatana ho to: `bash deploy.sh forget`.
- Token kabhi repo ya git ke remote link me nahi likha jaata.

## 4. Vercel se jodo (sirf ek baar)

1. vercel.com par **Continue with GitHub** se login karo.
2. **Add New > Project**, apni repo ke saamne **Import**.
3. **Environment Variables** me ye 4 daalo, phir **Deploy**:

| Naam | Kahan se milega |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram me **@BotFather** > `/newbot` |
| `TELEGRAM_CHAT_ID` | Ek private group banao, bot ko add karke admin banao (Pin Messages permission), group me ek message bhejo, phir browser me `https://api.telegram.org/bot<TOKEN>/getUpdates` kholo. `"chat":{"id": ...}` wala number (aksar `-100...` se shuru) |
| `ADMIN_PASSWORD_HASH` | `bash deploy.sh env` |
| `SESSION_SECRET` | `bash deploy.sh env` |

`bash deploy.sh env` password poochta hai aur dono lines print karta hai. Naam aur value alag-alag
Vercel me daalo. Admin login (`/admin/login`) par wahi password chalega.

Variables baad me badlo to Vercel > **Deployments > Redeploy** karna padta hai.

## 5. Roz ka kaam

Koi file badlo, phir:

```bash
cd ~/belanagar-saraswati-puja && bash deploy.sh
```

Naya code GitHub par jayega aur Vercel 1-2 minute me site update kar dega.

## Naya zip aaye to (update)

```bash
cd ~ && unzip -o ~/storage/downloads/belanagar-saraswati-puja.zip && cd belanagar-saraswati-puja && bash deploy.sh
```

Jo purani files ab kaam ki nahi (jaise pehle ki alag-alag API files), `deploy.sh` unhe apne aap hata
deti hai. Zip ka naam badal gaya ho (jaise `... (1).zip`) to wahi naam likho.

## Dikkat aaye to

- **Token error:** naya token banao (scope `repo` hona chahiye).
- **"Push nahi hua":** agar GitHub repo me pehle se files hain (jaise README), to koi naya repo naam
  chuno ya khaali repo banao.
- **Vercel build fail:** Deployments me fail wale deploy par click karo, Build Logs ka error copy karke
  bhej do.
- **Site khuli par data/admin nahi chal raha** ("सर्वर सही से सेटअप नहीं है"): 4 variables me se koi
  missing hai.
- **Vercel: "No more than 12 Serverless Functions":** naya zip lagao (upar wala update command). Ab poori
  API sirf 1 function hai.
