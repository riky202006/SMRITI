const fs = require('fs');
let html = fs.readFileSync('index 3.html', 'utf8');

// Inject sample images on load if empty
const sampleInjection = `
  // Initialize greeting on load
  document.addEventListener('DOMContentLoaded', () => {
    if(appData.patientName) {
      updateDashboardGreeting();
    }
    
    // Add sample gallery images if empty
    if(appData.images.length === 0) {
      appData.images = [
        { id: '1', dataUrl: 'https://i.pravatar.cc/300?img=68', name: 'Ravi' },
        { id: '2', dataUrl: 'https://i.pravatar.cc/300?img=47', name: 'Anita' },
        { id: '3', dataUrl: 'https://i.pravatar.cc/300?img=33', name: 'Kiran' },
        { id: '4', dataUrl: 'https://i.pravatar.cc/300?img=12', name: 'Sanjay' },
        { id: '5', dataUrl: 'https://i.pravatar.cc/300?img=5', name: 'Priya' }
      ];
      saveApp();
    }
  });
`;

html = html.replace(/\/\/ Initialize greeting on load[\s\S]*?\}\);/, sampleInjection);

fs.writeFileSync('index 3.html', html);
console.log("Injected sample gallery images");
