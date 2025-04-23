# Missing NPM Packages Installer

A simple VS Code / VSCodium extension that scans the currently open JavaScript/Typescript file for `import` and `require` statements and installs any missing external npm packages with a single click from an Activity Bar(vs-code-sidebar) icon.


---


## Features

- **One-click install**  
  Click the “NPM Installer” icon in the Activity Bar → click **Install Packages** → installs only the missing external packages used in your open file.

- **Built-in detection**  
  Automatically skips Node.js core modules (e.g. `fs`, `path`, `http`) and only installs real dependencies.

- **Scoped / deep imports**  
  Detects both top-level (e.g. `lodash`) and scoped packages (e.g. `@babel/core`).


---


## Prerequisites

```bash
    npm install --global @vscode/vsce
```

---


## Installation

```bash
   git clone https://github.com/arun0808rana/missing-pkgs-installer.git
   cd missing-pkgs-installer
```


---



## Generating an extension(.vsix file) from this repo

```bash
npm install
npm run compile
npm run package
```

