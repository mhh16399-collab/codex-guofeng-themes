# Codex Guofeng Themes

An unofficial, Windows-only theming layer for the official Codex desktop app, with three bundled Chinese-inspired themes: Zhuqing, Zhusha, and Moyun.

[中文主页](./README.md) · [Windows guide](./windows/README.md) · [MIT License](./LICENSE)

![Zhuqing preview](./docs/images/guofeng/zhuqing-preview.png)

## Highlights

- One-click switching from the Windows system tray
- Three reviewed built-in themes; Zhuqing is the fresh-install default
- Local image replacement, saved combinations, and ZIP theme import
- Allowlisted Safe CSS validation with bounded, atomic imports
- Failure rollback and a complete restore-to-official-appearance path
- No `WindowsApps`, `app.asar`, ACL, or application-signature modifications

## Source install

Requirements: Windows 10+ x64, the official Microsoft Store `OpenAI.Codex` app registered for the current user, and Node.js 22+ when running from source. Close Codex, open PowerShell in `windows`, then run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\scripts\install-dream-skin.ps1
```

Open **Codex Guofeng Themes** from the Start menu after installation. A public installer will be published through this repository's [Releases](https://github.com/mhh16399-collab/codex-guofeng-themes/releases); no Guofeng release is claimed until an installer and checksum are actually present there.

## Theme package

```text
my-theme/
├── background.jpg
├── theme.json
└── theme.css
```

Use [`windows/presets/preset-zhuqing`](./windows/presets/preset-zhuqing) as a reference. Contributions must include artwork redistribution rights and must not use unauthorized brands, characters, celebrity likenesses, or commercial wallpapers.

## Attribution

This fork is built on the MIT-licensed [Fei-Away/Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin) runtime and recovery work. Internal DreamSkin paths and protocol names remain for safe backward compatibility. The project is not affiliated with, endorsed by, or sponsored by OpenAI.
