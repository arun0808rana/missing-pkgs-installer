import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { builtinModules } from 'module';

class InstallItem extends vscode.TreeItem {
  constructor(context: vscode.ExtensionContext) {
    super('Install Packages', vscode.TreeItemCollapsibleState.None);
    this.command = {
      command: 'extension.installDependencies',
      title: 'Install NPM Packages in Current File'
    };
    const iconFile = path.join(context.extensionPath, 'resources', 'cloud-download.svg');
    this.iconPath = {
      light: vscode.Uri.file(iconFile),
      dark: vscode.Uri.file(iconFile)
    };
  }
}

class InstallerProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  constructor(private context: vscode.ExtensionContext) {}
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }
  getChildren(): vscode.TreeItem[] {
    return [new InstallItem(this.context)];
  }
}

function extractPackages(content: string): string[] {
  const requireRx = /require\(['"]([^'"]+)['"]\)/g;
  const importRx  = /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g;
  const pkgs      = new Set<string>();
  let m: RegExpExecArray | null;

  const isExternal = (n: string) =>
    !n.startsWith('.') &&
    !n.startsWith('/') &&
    !n.startsWith('node:') &&
    !builtinModules.includes(n);

  while ((m = requireRx.exec(content))) {
    let n = m[1].split('/')[0];
    if (n.startsWith('@')) {
      const parts = m[1].split('/');
      n = parts.slice(0, 2).join('/');
    }
    if (isExternal(n)) pkgs.add(n);
  }
  while ((m = importRx.exec(content))) {
    let n = m[1].split('/')[0];
    if (n.startsWith('@')) {
      const parts = m[1].split('/');
      n = parts.slice(0, 2).join('/');
    }
    if (isExternal(n)) pkgs.add(n);
  }
  return Array.from(pkgs);
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new InstallerProvider(context);
  vscode.window.createTreeView('jsInstallerView', {
    treeDataProvider: provider,
    showCollapseAll: false
  });

  const installCmd = vscode.commands.registerCommand(
    'extension.installDependencies',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
      }
      const content = editor.document.getText();
      const pkgs = extractPackages(content);
      if (pkgs.length === 0) {
        vscode.window.showInformationMessage('No external packages found.');
        return;
      }
      const ws = vscode.workspace.workspaceFolders;
      if (!ws) {
        vscode.window.showErrorMessage('No workspace folder open.');
        return;
      }
      const cwd = ws[0].uri.fsPath;
      const cmd = `npm install ${pkgs.join(' ')}`;
      vscode.window.showInformationMessage(`Installing: ${pkgs.join(', ')}`);
      exec(cmd, { cwd }, (err, _stdout, stderr) => {
        if (err) {
          vscode.window.showErrorMessage(`Error: ${stderr}`);
        } else {
          vscode.window.showInformationMessage(`Installed: ${pkgs.join(', ')}`);
        }
      });
    }
  );

  context.subscriptions.push(installCmd);
}

export function deactivate() {}
