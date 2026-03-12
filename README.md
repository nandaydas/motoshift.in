# 🏍️ MotoShift.in — Coming Soon Landing Page

> **Your new home for raw motorcycle reviews, epic route guides, and unfiltered two-wheeled culture.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 About

**MotoShift.in** is an upcoming Indian motorcycle media platform focused on honest two-wheeler content — from real-world reviews and riding routes to moto culture. This repository contains the pre-launch **"Coming Soon"** landing page, designed to build an early-access email waitlist before the full site goes live.

---

## ✨ Features

- 🔥 **Modern Dark UI** — Sleek dark theme with aggressive orange (`#ff5500`) accents
- 📱 **Fully Responsive** — Stacked layout on mobile, split-screen on desktop
- ✉️ **Email Waitlist Form** — Capture early-interest subscribers with a clean notify-me form
- 🎨 **Premium Typography** — Uses [Inter](https://fonts.google.com/specimen/Inter) & [Oswald](https://fonts.google.com/specimen/Oswald) from Google Fonts
- ⚡ **Zero Build Step** — Pure HTML + Tailwind CDN + Lucide Icons, no Node.js required
- 🔗 **Social Links** — Instagram, Facebook, and YouTube integration

---

## 🗂️ Project Structure

```
motoshift.in/
└── index.html        # Single-page coming soon landing page
```

---

## 🚀 Getting Started

No build tools required. Simply open the file in a browser:

```bash
# Clone the repository
git clone https://github.com/your-username/motoshift.in.git

# Open directly in your browser
open index.html
# or on Windows:
start index.html
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| HTML5 | Page structure & semantics |
| [Tailwind CSS (CDN)](https://tailwindcss.com/docs/installation/play-cdn) | Utility-first styling |
| [Lucide Icons](https://lucide.dev/) | Crisp, consistent iconography |
| Google Fonts | Inter & Oswald typefaces |

---

## 🎨 Design Tokens

| Token | Value | Usage |
|---|---|---|
| `moto-orange` | `#ff5500` | Primary accent, CTAs, glow effects |
| `moto-dark` | `#0a0a0a` | Main background |
| `moto-panel` | `#171717` | Card & input backgrounds |

---

## 📬 Email Form Integration

The form currently simulates a successful submission (client-side only). To connect it to a real backend:

- **[Mailchimp](https://mailchimp.com/)** — Replace the `form` action with your Mailchimp embed URL
- **[Formspree](https://formspree.io/)** — Set `action="https://formspree.io/f/YOUR_ID"` on the form
- **Custom API** — POST `emailInput.value` to your own endpoint inside the `submit` event listener

---

## 🔗 Social

| Platform | Handle |
|---|---|
| Instagram | [@mr_nanday](https://www.instagram.com/mr_nanday/) |
| Facebook | [nandaydas](https://www.facebook.com/nandaydas/) |
| YouTube | [@nandayvlogs8655](https://www.youtube.com/@nandayvlogs8655) |

---

## 📄 License

This project is licensed under the **MIT License** — feel free to fork and adapt.

---

<p align="center">
  Made with ❤️ for the Indian riding community · © 2026 MotoShift
</p>
