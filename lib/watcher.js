import chokidar from 'chokidar';
import path from 'path';
import { pathToFileURL } from 'url';
import chalk from 'chalk';

export function setupWatcher(pluginsFolder) {
    const watcher = chokidar.watch(['plugins/', 'handler.js', 'config.js'], {
        persistent: true,
        ignoreInitial: true,
        usePolling: true,
        interval: 500,
        binaryInterval: 1000
    });

    watcher.on('change', async (filePath) => {
        const fileName = path.basename(filePath);
        if (fileName.startsWith('.')) return;
        
        const fileUrl = `${pathToFileURL(path.resolve(filePath)).href}?v=${Date.now()}`;
        
        try {
            if (filePath.includes('plugins/')) {
                const plugin = await import(fileUrl);
                global.plugins[fileName] = plugin.default || plugin;
                console.log(chalk.cyan(`[ WATCHER ] Plugin ricaricato: ${fileName}`));
            } else if (fileName === 'handler.js') {
                await import(fileUrl);
                console.log(chalk.magenta(`[ WATCHER ] Handler aggiornato`));
            }
        } catch (e) {
            console.log(chalk.red(`[ WATCHER ERROR ] ${fileName}: ${e.message}`));
        }
    });

    watcher.on('add', async (filePath) => {
        const fileName = path.basename(filePath);
        if (filePath.includes('plugins/') && !fileName.startsWith('.')) {
            try {
                const fileUrl = `${pathToFileURL(path.resolve(filePath)).href}?v=${Date.now()}`;
                const plugin = await import(fileUrl);
                global.plugins[fileName] = plugin.default || plugin;
                console.log(chalk.green(`[ WATCHER ] Nuovo plugin: ${fileName}`));
            } catch (e) {}
        }
    });
}
