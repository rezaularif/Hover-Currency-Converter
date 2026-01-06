 document.addEventListener('DOMContentLoaded', () => {
   const getStartedBtn = document.getElementById('getStartedBtn');
   
   getStartedBtn.addEventListener('click', async () => {
     // Get the current tab and open the side panel
     try {
       const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
       if (tab) {
         await chrome.sidePanel.open({ windowId: tab.windowId });
       }
     } catch (error) {
       console.log('Could not open side panel:', error);
     }
     
     // Close this welcome tab
     window.close();
   });
   
   // Keyboard accessibility
   getStartedBtn.addEventListener('keydown', (e) => {
     if (e.key === 'Enter' || e.key === ' ') {
       e.preventDefault();
       getStartedBtn.click();
     }
   });
 });
