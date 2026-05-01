const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'client/src');

function findAndReplaceInFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            findAndReplaceInFiles(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // 1. Text Colors
            content = content.replace(/text-gray-900 dark:text-white/g, 'text-foreground');
            content = content.replace(/text-gray-900 dark:text-gray-100/g, 'text-foreground');
            content = content.replace(/text-gray-800 dark:text-gray-200/g, 'text-foreground');
            content = content.replace(/text-gray-700 dark:text-gray-300/g, 'text-foreground');
            content = content.replace(/text-gray-600 dark:text-gray-400/g, 'text-muted-foreground');
            content = content.replace(/text-gray-500 dark:text-gray-400/g, 'text-muted-foreground');
            content = content.replace(/text-gray-500 dark:text-gray-500/g, 'text-muted-foreground');
            content = content.replace(/text-gray-400 dark:text-gray-600/g, 'text-muted-foreground');
            content = content.replace(/dark:text-white/g, 'text-foreground'); // Catch stragglers
            content = content.replace(/text-gray-900/g, 'text-foreground'); // Catch stragglers

            // 2. Background Colors
            content = content.replace(/bg-white dark:bg-gray-[0-9]+/g, 'bg-card ember-glow');
            content = content.replace(/bg-gray-50 dark:bg-gray-[0-9]+\/?[0-9]*/g, 'bg-muted');
            content = content.replace(/bg-gray-100 dark:bg-gray-[0-9]+\/?[0-9]*/g, 'bg-muted');
            content = content.replace(/bg-gray-200 dark:bg-gray-[0-9]+\/?[0-9]*/g, 'bg-muted');
            content = content.replace(/dark:bg-gray-[0-9]+/g, 'bg-card ember-glow'); // Catch stragglers

            // 3. Borders
            content = content.replace(/border-gray-[0-9]+ dark:border-gray-[0-9]+/g, 'border-border');
            content = content.replace(/border border-gray-[0-9]+/g, 'border-none');
            
            // 4. Divide
            content = content.replace(/divide-gray-[0-9]+ dark:divide-gray-[0-9]+/g, 'divide-border');

            // 5. Hover states
            content = content.replace(/hover:bg-gray-[0-9]+ dark:hover:bg-gray-[0-9]+\/?[0-9]*/g, 'hover:bg-muted/80');

            // Write back if changed
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

findAndReplaceInFiles(directoryPath);
console.log('Refactoring complete.');
