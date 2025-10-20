chrome.runtime.onInstalled.addListener(() => {
    console.log('Task Manager extension installed.');
  });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith('task_')) {
      const taskId = alarm.name;
      chrome.storage.local.get(['tasks'], (result) => {
        const tasks = result.tasks || [];
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          chrome.notifications.create(taskId, {
            type: 'basic',
            iconUrl: 'icons/icon128.png', // <-- GARANTA QUE ESTA LINHA ESTÁ ASSIM
            title: 'Lembrete de Tarefa!',
            message: `Não se esqueça da sua tarefa: "${task.title}"`,
            priority: 2
          });
        }
      });
    }
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'createAlarm') { /* ... (código existente) ... */ } 
    else if (message.type === 'removeAlarm') { /* ... (código existente) ... */ }
  });
  