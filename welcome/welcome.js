 document.addEventListener('DOMContentLoaded', () => {
   const getStartedBtn = document.getElementById('getStartedBtn');
   
   getStartedBtn.addEventListener('click', async () => {
     // Get the current tab and open the side panel
     try {
       const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
       if (!tab) throw new Error('No active tab available');
       await chrome.sidePanel.open({ windowId: tab.windowId });
     } catch (error) {
       console.error('Could not open side panel:', error);
       return;
     }
     
     // Close this welcome tab
     window.close();
   });
   
 });
