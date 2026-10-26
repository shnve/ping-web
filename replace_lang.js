const fs = require('fs');
const path = require('path');

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

walkSync('c:/Users/meben/Documents/SHN/shnve_s124/ping-web/src/app', function(filePath, stat) {
    if (filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;

        // Replace lang === 'fr' ? 'name' : 'internationalName'
        newContent = newContent.replace(/===\s*'fr'\s*\?\s*'name'\s*:\s*'internationalName'/g, "=== 'es' ? 'name' : 'internationalName'");
        
        // Replace === 'fr' ? folderData.name : folderData.internationalName
        newContent = newContent.replace(/===\s*'fr'\s*\?\s*([a-zA-Z0-9_]+)\.name\s*:\s*\1\.internationalName/g, "=== 'es' ? $1.name : $1.internationalName");
        
        // Replace === 'fr' ? this.recipient.information : this.recipient.localizedInformation
        newContent = newContent.replace(/===\s*'fr'\s*\?\s*this\.recipient\.information\s*:\s*this\.recipient\.localizedInformation/g, "=== 'es' ? this.recipient.information : this.recipient.localizedInformation");
        
        // Replace currentLang === 'fr' in specific pipes and services
        if (filePath.endsWith('translate-name.pipe.ts') || 
            filePath.endsWith('translateIn.pipe.ts') || 
            filePath.endsWith('export-pdf.service.ts') || 
            filePath.endsWith('subscription-modal.component.ts') || 
            filePath.endsWith('maritime-entity.factory.ts')) {
             newContent = newContent.replace(/currentLang\s*===\s*'fr'/g, "currentLang === 'es'");
             newContent = newContent.replace(/lang\s*===\s*'fr'/g, "lang === 'es'");
        }
        
        // Map component: cartoLanguage
        if (filePath.endsWith('map.component.ts')) {
             newContent = newContent.replace(/lang\s*===\s*'fr'\s*\?\s*'fr-FR'\s*:\s*'en-US'/g, "lang === 'es' ? 'es-ES' : 'en-US'");
        }
        
        // infosource part format
        if (filePath.endsWith('infosource-part-format-details-modal-object.pipe.ts')) {
             newContent = newContent.replace(/currentLang\s*===\s*'fr'/g, "currentLang === 'es'");
        }

        // test files
        if (filePath.endsWith('lang-dropdown.component.spec.ts')) {
             newContent = newContent.replace(/currentLang\s*===\s*'fr'/g, "currentLang === 'es'");
        }

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Modified: ' + filePath);
        }
    }
});
