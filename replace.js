const fs = require('fs');
const path = require('path');

function replaceInFolder(dir, replacements) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.expo') {
                replaceInFolder(fullPath, replacements);
            }
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            for (const [from, to] of replacements) {
                if (content.includes(from)) {
                    content = content.split(from).join(to);
                    changed = true;
                }
            }
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated', fullPath);
            }
        }
    }
}

replaceInFolder(path.join(__dirname, 'apps/customer'), [
    ['@/constants/', '@shared/constants/'],
    ['@/types/', '@shared/types/']
]);

replaceInFolder(path.join(__dirname, 'apps/merchant'), [
    ['@/constants/', '@shared/constants/'],
    ['@/types/', '@shared/types/'],
    ['../constants/colors', '@shared/constants/colors'],
    ['../../constants/colors', '@shared/constants/colors'],
    ['../../../constants/colors', '@shared/constants/colors'],
    ['../../utils/time', '@shared/utils/time'],
    ['../utils/time', '@shared/utils/time']
]);
