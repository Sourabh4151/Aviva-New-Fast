# Assets work on localhost but not in production

## The issue

Images, SVGs, or other files from `src/assets/` work in **development** (localhost) but **don’t load in production** (e.g. 404, missing background image, missing icons).

## Why it happens

- **Development:** The dev server (e.g. Vite) serves your project from disk. A path like `/src/assets/hero.jpg` or `/src/assets/tick.svg` is served correctly.
- **Production:** The app is built into a folder like `dist/`. Only built files are deployed; there is **no** `src/` folder. So the browser requests `/src/assets/hero.jpg` and gets **404**.

So any **raw path** that points at `src/` (e.g. `/src/assets/...`) will only work in dev, not in production.

## How to fix it

**Do not use raw paths for assets that live in `src/`.**  
**Do use ES module imports** so the bundler (e.g. Vite) can see the file, copy it into the build, and replace the reference with the correct production URL.

### 1. Images (e.g. hero background, PNGs, JPGs)

**Wrong (breaks in production):**
```js
const HERO_PATH = "/src/assets/desktop.jpg";
// ...
style={{ backgroundImage: `url(${HERO_PATH})` }}
```

**Correct:**
```js
import heroImage from "../assets/desktop.jpg";
// ...
style={{ backgroundImage: `url(${heroImage})` }}
```

### 2. Icons / SVGs in `<img>`

**Wrong (breaks in production):**
```jsx
<img src="/src/assets/tick.svg" alt="tick" />
```

**Correct:**
```js
import tickSvg from "../assets/tick.svg";
// ...
<img src={tickSvg} alt="tick" />
```

### 3. Other assets (logos, etc.)

**Wrong:**
```jsx
<img src="/src/assets/crack-ed_logo.svg" alt="Logo" />
```

**Correct:**
```js
import logo from "../assets/crack-ed_logo.svg";
// ...
<img src={logo} alt="Logo" />
```

## Rule of thumb

- **Any asset under `src/`** (e.g. `src/assets/`) → **import it** in the component that uses it.  
  Use the imported variable in `src=`, `url()`, etc.  
  Do **not** hardcode `/src/assets/...` in strings.
- **Assets in `public/`** can be referenced by path (e.g. `/tick.svg`) and will work in production as long as they are actually copied to the build output.

## How to find the same issue elsewhere

Search the codebase for:

- `"/src/assets/` or `'/src/assets/`
- `src="/src/` or `src='/src/`
- `url(/src/` or `url("/src/`

Replace each with an **import** at the top of the file and use the imported variable where the path was used.

## Summary

| Environment   | Raw path `/src/assets/file.svg` | Import `import f from "../assets/file.svg"` |
|---------------|----------------------------------|--------------------------------------------|
| Localhost     | Works (dev server serves it)     | Works                                      |
| Production    | 404 (no `src/` in build)         | Works (bundler emits correct URL)          |

**Fix:** Use imports for all assets under `src/` so the bundler can bundle them and generate correct production URLs.
