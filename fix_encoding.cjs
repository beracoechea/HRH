const fs = require('fs');
const path = require('path');

const filePaths = [
  'src/components/Admin/UserDetailsModal.jsx'
];

const replacements = {
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã±': 'ñ',
  'Ã‘': 'Ñ',
  'Ã ': 'Á',
  'Ã‰': 'É',
  'Ã ': 'Í',
  'Ã“': 'Ó',
  'Ãš': 'Ú',
  'Ã¼': 'ü',
  'Â': ''
};

filePaths.forEach((relPath) => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    for (const [bad, good] of Object.entries(replacements)) {
      content = content.replaceAll(bad, good);
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed accents in ' + relPath);
  } else {
    console.log('File not found: ' + relPath);
  }
});
