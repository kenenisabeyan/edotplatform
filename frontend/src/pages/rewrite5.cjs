const fs = require('fs');

const filePath = 'c:/Users/kenenisa/Documents/futurelearning/frontend/src/pages/MessagesView.jsx';
const content = fs.readFileSync(filePath, 'utf-8');

const logicEndIndex = content.indexOf('  const groupableContacts = contacts.filter(');
if (logicEndIndex === -1) {
  console.log('failed to find split marker');
  process.exit(1);
}

const logicPart = content.substring(0, logicEndIndex);
const newReturnBlock = fs.readFileSync('c:/Users/kenenisa/Documents/futurelearning/frontend/src/pages/newReturnBlock.txt', 'utf8');

fs.writeFileSync(filePath, logicPart + newReturnBlock);
console.log('Successfully replaced the return block!');
