const zm = require('zod-mocking');
console.log('Keys:', Object.keys(zm));
console.log('Type of zm:', typeof zm);
if (zm.default) {
    console.log('Keys of zm.default:', Object.keys(zm.default));
}
