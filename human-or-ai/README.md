# HUMAN OR AI? 🤖👤

> *Can you tell the difference?* — An interactive quiz game for tech events

A polished, browser-based game where players must identify whether content was created by a human or AI. Includes two separate game modes, a live leaderboard, and a full admin panel.

---

## 🎮 Game Modes

### Game 1 — Image & Text Quiz
Players are shown images or text snippets and must guess: **Human** or **AI?**
- 12 questions per round (configurable)
- +10 points per correct answer
- Max score: 120

### Game 2 — Chat Detective
Players are shown a chat conversation and must identify if they're talking to a **real human** or an **AI chatbot**.
- 10 rounds per session
- 30-second timer per round
- Clue hints displayed alongside each conversation

---

## 📁 Project Structure

```
human-or-ai/
├── public/
│   ├── index.html          ← Landing page
│   ├── quiz.html           ← Game 1: Image & Text
│   ├── chat-game.html      ← Game 2: Chat Detective
│   ├── leaderboard.html    ← Live leaderboard
│   ├── admin.html          ← Admin dashboard
│   ├── styles.css          ← Complete design system
│   ├── app.js              ← Shared utilities + data
│   ├── quiz.js             ← Game 1 logic
│   ├── chat-game.js        ← Game 2 logic
│   ├── leaderboard.js      ← Leaderboard logic
│   └── admin.js            ← Admin panel logic
├── netlify/
│   └── functions/          ← (Reserved for future serverless use)
├── netlify.toml            ← Netlify config + redirects
├── package.json
└── README.md
```

---

## 🚀 Running Locally

### Option 1: Simple (no Node required)
Just open `public/index.html` in your browser.  
> ⚠️ Some browsers restrict local file access. Use Option 2 for full functionality.

### Option 2: Using Node.js
```bash
# Install dependencies
npm install

# Start local server
npm run dev

# Open in browser
open http://localhost:3000
```

### Option 3: Using Python
```bash
cd public
python3 -m http.server 3000
# Open http://localhost:3000
```

---

## ☁️ Deploying to Netlify

### Method 1: Drag & Drop (Fastest)
1. Go to [netlify.com](https://netlify.com) and log in
2. From your dashboard, drag the **`public/`** folder into the deploy area
3. Done! Your site is live.

### Method 2: GitHub + Auto-Deploy
1. Push this project to a GitHub repository
2. Log in to [netlify.com](https://netlify.com)
3. Click **"Add new site" → "Import an existing project"**
4. Connect your GitHub repo
5. Set build settings:
   - **Build command:** *(leave empty)*
   - **Publish directory:** `public`
6. Click **Deploy**

### Method 3: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --dir=public --prod
```

---

## 🔐 Admin Panel

Access at: `/admin.html` or `/admin`

**Credentials:**
- Username: `admin`
- Password: `CISIEEEBMSIT@2026`

### Admin Features:
| Tab | Features |
|-----|----------|
| **Leaderboard** | View, edit scores, delete players, reset, export CSV |
| **Quiz Content** | Add/edit/delete Game 1 questions |
| **Chat Content** | Add/edit/delete Game 2 chat scenarios |
| **Settings** | Change question count, enable event mode, reset database |

---

## ✏️ Customizing Quiz Questions (Game 1)

### Via Admin Panel (Recommended)
1. Go to `/admin.html`
2. Click **"Quiz Content"** tab
3. Click **"+ Add Question"**
4. Fill in: Type, Content, Answer, Explanation
5. Save

### Via Code
Edit the `DEFAULT_QUESTIONS` array in `public/app.js`:

```javascript
{
  id: 'q_unique_id',
  type: 'text',            // 'text' or 'image'
  content: 'Your content or image URL here',
  answer: 'human',         // 'human' or 'ai'
  explanation: 'Why this is human/AI...'
}
```

---

## 💬 Customizing Chat Scenarios (Game 2)

### Via Admin Panel (Recommended)
1. Go to `/admin.html`
2. Click **"Chat Content"** tab
3. Click **"+ Add Chat Scenario"**
4. Fill in all fields, including messages as JSON

### Message JSON format:
```json
[
  { "sender": "them", "text": "Hello, how can I help?" },
  { "sender": "you", "text": "I have a question..." },
  { "sender": "them", "text": "Sure, go ahead!" }
]
```
- `"sender": "them"` = the mystery contact (human or AI)
- `"sender": "you"` = the player's side of the conversation

---

## ⚙️ Configuration Options

All settings are stored in `localStorage` and manageable via the Admin panel:

| Setting | Default | Description |
|---------|---------|-------------|
| `questionCount` | 12 | Questions per Game 1 session |
| `eventMode` | false | Larger fonts, touch-friendly, kiosk mode |
| `autoReset` | false | Auto-return to home after game ends |

---

## 📺 Event Mode

Enable from Admin → Settings → "Event Mode"

When active:
- Larger fonts for projector visibility
- Bigger touch-friendly buttons
- Optimized for kiosk/tablet display
- Auto-return to home after game ends (if autoReset enabled)

---

## 🎯 Leaderboard

- Stores top scores per game mode
- Sorts by highest score
- Auto-refreshes every 5 seconds
- Highlights the current player's rank
- Separate tabs: Image & Text, Chat Detective, All Games
- Top 3 podium display

---

## 💾 Data Storage

All data is stored in the browser's `localStorage`:
- `hoai_leaderboard` — Player scores
- `hoai_questions` — Game 1 questions
- `hoai_chat_questions` — Game 2 chat scenarios  
- `hoai_settings` — App settings

> For a production multi-device deployment, you'd replace localStorage with a real database. The `netlify/functions/` folder is ready for serverless function integration.

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#6C63FF` |
| Accent | `#00E5FF` |
| Background | `#0F0F1A` |
| Human color | `#00E5B4` |
| AI color | `#FF6B8A` |
| Font | Space Grotesk + Orbitron |

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (no frameworks)
- **Hosting:** Netlify (static)
- **Storage:** Browser localStorage
- **Fonts:** Google Fonts
- **Audio:** Web Audio API (sound effects)
- **Animations:** CSS animations + Web Animations API

---

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari / Chrome for Android

---

*Built for tech events. Run it on a laptop, project the leaderboard on a big screen, and watch the crowd compete!*
