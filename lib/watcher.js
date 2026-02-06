import chokidar from 'chokidar';
import path from 'path';
import { pathToFileURL } from 'url';
import chalk from 'chalk';

export function setupWatcher(pluginsFolder) {
    const watcher = chokidar.watch(['plugins/', 'handler.js', 'config.js', 'lib/'], {
        persistent: true,
        ignoreInitial: true
    });

    watcher.on('change', async (filePath) => {
        const fileName = path.basename(filePath);
        const fileUrl = pathToFileURL(path.resolve(filePath)).href;
        console.log(chalk.yellow.bold(`[ EDIT ] `) + chalk.white(`File modificato: ${fileName}`));
        
        if (filePath.includes('plugins/')) {
            const plugin = await import(`${fileUrl}?update=${Date.now()}`);
            global.plugins[fileName] = plugin.default || plugin;
        } else if (fileName === 'handler.js' || fileName === 'config.js') {
            await import(`${fileUrl}?update=${Date.now()}`);
        }
    });

    watcher.on('add', async (filePath) => {
        const fileName = path.basename(filePath);
        if (filePath.includes('plugins/')) {
            const fileUrl = pathToFileURL(path.resolve(filePath)).href;
            const plugin = await import(`${fileUrl}?update=${Date.now()}`);
            global.plugins[fileName] = plugin.default || plugin;
        }
    });

    return watcher;
}