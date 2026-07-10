# Credentials Setup — Cloudinary

Immense Perfumery gets its **own** Cloudinary account — separate from Nabi and Confidence — so media storage, bandwidth, and billing don't overlap between projects.

## Step 1 — Create the account (no card required)

1. Go to **https://cloudinary.com/users/register_free**
2. Sign up with an email + password, or "Continue with Google."
3. The **Free** plan is selected automatically — 25GB storage, 25GB bandwidth/month, no credit card needed.
4. Verify your email if Cloudinary asks for it.
5. You'll land on the **Dashboard** — skip/close any "take a tour" popups.

## Step 2 — Copy the 3 credentials

On the Dashboard there's a card called **"API Environment variable"** (or **"Product Environment Credentials"**) showing:

- **Cloud name**
- **API Key**
- **API Secret** — click the eye / "reveal" icon to see it

Copy all three.

## Step 3 — Send them over (or add them yourself)

Either:
- Paste the 3 values in chat and they'll be added to the project's env file, **or**
- Add them yourself to `.env.local` in the project root:
  ```
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  ```

**One rule:** the **API Secret** is like a password for the account — don't paste it anywhere public (screenshots, group chats, GitHub issues). Chat here or a private `.env.local` file is fine.

That's it — no other setup needed on the Cloudinary side. Folder structure and upload rules are handled from the code.
