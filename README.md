# 3D Car Racing Game

A browser-based car racing game playable on GitHub Pages.

## Project Structure

```
CarGame-GitHub/
├── index.html
├── style.css
├── game.js
├── assets/
│   ├── car1.png  (player car image)
│   ├── car2.png  (AI car 1 image)
│   └── car3.png  (AI car 2 image)
└── README.md
```

## How to Use

1. **Add Car Images:**
   - Place your car images in the `assets/` folder as `car1.png`, `car2.png`, and `car3.png`.
   - You can use any top-down car PNGs (transparent background recommended).
   - For testing, you can use placeholder images or download free car sprites from sites like [kenney.nl/assets](https://kenney.nl/assets) or [opengameart.org].

2. **Deploy to GitHub Pages:**
   - Create a new repository on GitHub (e.g., `CarGame-GitHub`).
   - Upload all files and folders from this project.
   - In your repo, go to **Settings > Pages**.
   - Set the source to the `main` branch (or `docs/` folder if you prefer).
   - Your game will be live at:
     ```
     https://<your-github-username>.github.io/<repo-name>/
     ```
   - Example:
     ```
     https://yourusername.github.io/CarGame-GitHub/
     ```

3. **Play the Game:**
   - Open the link in your browser and enjoy!

## Controls
- Arrow keys to drive your car.
- Reach each checkpoint before the timer runs out.
- Compete against two AI cars.

---

**Customize:**
- Replace car images in `assets/` for your own style.
- Edit `game.js` for more features or different tracks.

---

*Created for browser play and GitHub Pages deployment.* 