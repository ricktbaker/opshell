const {Menu} = require('electron');

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Import Settings',
        click: function (menuItem, currentWindow) {
          currentWindow.webContents.send('landingpage.importSettings');
        }
      },
      {
        label: 'Export Settings',
        click: function (menuItem, currentWindow) {
          currentWindow.webContents.send('landingpage.exportSettings');
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: 'Opshell',
    submenu: [
      {
        label: 'About Opshell',
        click: function (menuItem, currentWindow) {
          currentWindow.webContents.send('aboutWindow');
        }
      },
      {
        label: 'What\'s New',
        click: function (menuItem, currentWindow) {
          const data = {};
          data.type = 'whatsNew';
          currentWindow.webContents.send('mainview.openTab', data);
        }
      },
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  });
  template.push({
    label: 'Help',
    submenu: [
      {
        label: 'Getting Started',
        click: function (menuItem, currentWindow) {
          const data = {};
          data.type = 'gettingStarted';
          currentWindow.webContents.send('mainview.openTab', data);
        }
      }
    ]
  });
}
if (process.platform === 'win32') {
  template.push({
    label: 'Help',
    submenu: [
      {
        label: 'About Opshell',
        click: function (menuItem, currentWindow) {
          currentWindow.webContents.send('aboutWindow');
        }
      },
      {
        label: 'What\'s New',
        click: function (menuItem, currentWindow) {
          const data = {};
          data.type = 'whatsNew';
          currentWindow.webContents.send('mainview.openTab', data);
        }
      },
      {
        label: 'Getting Started',
        click: function (menuItem, currentWindow) {
          const data = {};
          data.type = 'gettingStarted';
          currentWindow.webContents.send('mainview.openTab', data);
        }
      }
    ]
  });
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
