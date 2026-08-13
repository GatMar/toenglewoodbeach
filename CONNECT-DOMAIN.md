# Connect toenglewoodbeach.com (GitHub Pages + GoDaddy)

Your domain is registered at **GoDaddy** (name servers: `domaincontrol.com`).  
Hosting will be **GitHub Pages** under your **GatMar** account — same pattern as MariCooks and Florida Nature Prints.

---

## Status checklist

| Step | What | Status |
|------|------|--------|
| 1 | Site committed on this Mac | ✅ Done |
| 2 | Create public GitHub repo `toenglewoodbeach` | ✅ Done |
| 3 | Push site to GitHub | ✅ Done |
| 4 | Enable GitHub Pages (main / root) | ⏳ In GitHub Settings |
| 5 | Point GoDaddy DNS to GitHub | ⏳ You in GoDaddy |
| 6 | Custom domain + HTTPS | ⏳ |
| 7 | Wait for DNS (minutes–hours) | ⏳ |

**Repo:** https://github.com/GatMar/toenglewoodbeach  
**Domain:** toenglewoodbeach.com

---

## Step A — Create the GitHub repository

1. Log in as **GatMar**: https://github.com/login  
2. Open: https://github.com/new  
3. Settings:
   - **Repository name:** `toenglewoodbeach`
   - **Public** (required for free GitHub Pages)
   - **Do not** add README, .gitignore, or license  
4. Click **Create repository**

---

## Step B — Push the site (Terminal)

```bash
cd /Users/maricooks/tropical-oasis-florida

git remote remove origin 2>/dev/null
git remote add origin git@github.com:GatMar/toenglewoodbeach.git
git branch -M main
git push -u origin main
```

Confirm files at: https://github.com/GatMar/toenglewoodbeach  

---

## Step C — Turn on GitHub Pages

1. Repo → **Settings** → **Pages**  
2. **Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
3. **Save**  
4. Wait ~1–2 minutes, then test:  
   https://gatmar.github.io/toenglewoodbeach/

---

## Step D — Custom domain in GitHub

1. Still **Settings → Pages**  
2. **Custom domain:** `toenglewoodbeach.com` → **Save**  
3. Leave **Enforce HTTPS** checked once it becomes available  

The repo already includes a `CNAME` file with:

```text
toenglewoodbeach.com
```

---

## Step E — GoDaddy DNS (important)

1. Log in at [https://dcc.godaddy.com](https://dcc.godaddy.com) or GoDaddy → **My Products** → **DNS** for `toenglewoodbeach.com`  
2. Remove or stop **domain forwarding / parking** if the site currently shows a GoDaddy page.  
3. Set these records (GitHub Pages standard):

### Apex domain `toenglewoodbeach.com`

| Type | Name | Value | TTL |
|------|------|--------|-----|
| **A** | `@` | `185.199.108.153` | 600 |
| **A** | `@` | `185.199.109.153` | 600 |
| **A** | `@` | `185.199.110.153` | 600 |
| **A** | `@` | `185.199.111.153` | 600 |

### www

| Type | Name | Value | TTL |
|------|------|--------|-----|
| **CNAME** | `www` | `gatmar.github.io` | 600 |

4. Delete any old A records pointing to parking IPs (e.g. `13.248.x.x` / `76.223.x.x`) so only the four GitHub A records remain for `@`.  
5. Save.

Official GitHub DNS help:  
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

---

## Step F — Wait and verify

```bash
# When DNS is ready, these should show GitHub addresses:
dig +short toenglewoodbeach.com A
dig +short www.toenglewoodbeach.com CNAME
```

Then open:

- https://toenglewoodbeach.com  
- https://www.toenglewoodbeach.com  

HTTPS certificate can take **up to 24 hours** (often much faster). Keep **Enforce HTTPS** on when GitHub allows it.

---

## Optional — email alias

In GoDaddy **Email Forwarding**:

| Alias | Forward to |
|-------|------------|
| `stay@toenglewoodbeach.com` | your me.com address |

Then finish Web3Forms in `js/config.js` (see `GO-LIVE.md`).

---

## Quick “I created the empty repo — push for me”

Tell Grok: **“repo is created, push it”** after Step A, and we can run Step B from here.
