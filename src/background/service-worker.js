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
          iconUrl: 'icons/icon128.png', // <-- A CORREÇÃO FINAL ESTÁ AQUI
          title: 'Lembrete de Tarefa!',
          message: `Não se esqueça da sua tarefa: "${task.title}"`,
          priority: 2
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'createAlarm') {
    const task = message.task;
    // Verifica se a data e hora estão no formato correto
    if (task.date && task.time) {
      const alarmTime = new Date(`${task.date}T${task.time}:00`).getTime();
      if (alarmTime > Date.now()) {
        chrome.alarms.create(task.id, { when: alarmTime });
      }
    }
  } else if (message.type === 'removeAlarm') {
    chrome.alarms.clear(message.taskId);
  }
});