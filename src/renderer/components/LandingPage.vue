<template>
  <div id="wrapper">
    <link id="theme" rel="stylesheet" href="static/dark.css">
    <alertBox></alertBox>
    <div class="row" style="margin: 0">
      <leftMenu></leftMenu>
      <orgMenu></orgmenu>
      <mainView></mainView>
    </div>
    <about></about>
  </div>
</template>
<script>
import AlertBox from './AlertBox.vue';
import LeftMenu from './LeftMenu';
import OrgMenu from './OrgMenu';
import MainView from './MainView.vue';
import About from './modals/About.vue';
import { ipcRenderer } from 'electron';
import archiver from 'archiver';
import unzipper from 'unzipper';
import fs from 'fs-extra';
import dir from 'node-dir';
import path from 'path';
import _ from 'lodash';

const { app, dialog } = require('electron').remote;
export default {
  name: 'landing-page',
  mounted: async function() {
    ipcRenderer.on('landingpage.exportSettings', () => {
      this.exportSettings();
    });
    ipcRenderer.on('landingpage.importSettings', () => {
      this.importSettings();
    });
    ipcRenderer.on('aboutWindow', () => {
      $('#about').modal('show');
    });
    ipcRenderer.send('orgmenu.updateSelectBox');
  },
  components: {
    LeftMenu, OrgMenu, AlertBox, MainView, About
  },
  methods: {
    /**
     * Restore Settings
     */
    importSettings: function() {
      const vue = this;
      dialog.showOpenDialog({
        title: 'Import Opshell Settings from opshell_settings.zip',
        properties: ['openFile'],
        defaultPath: app.getPath('documents'),
        filters: [
          {extensions: ['zip']}
        ]
      }, (path) => {
        if (path) {
          const settingsFile = path[0];
          const tempDir = app.getPath('temp');
          fs.createReadStream(settingsFile)
            .pipe(unzipper.Extract({ path: tempDir }))
            .promise()
            .then(async function (entry) {
              vue.doRestore(tempDir);
            });
        }
      });
    },

    doRestore: async function(tempDir) {
      const homeDir = path.join(app.getPath('home'), '.opshell');
      const dbDir = app.getPath('userData');
      console.log(dbDir);
      await fs.copy(path.join(tempDir, 'opshell_export', 'opshell_keys'), homeDir);
      await fs.copy(path.join(tempDir, 'opshell_export', 'opshell_db'), dbDir);
      dir.files(homeDir, function(err, files) {
        if (err) throw err;
        _.each(files, async (file) => {
          await fs.chmod(file, '0600');
        });
      });
      this.$db.orgs.loadDatabase();
      this.$db.awsRegions.loadDatabase();
      this.$db.tempData.loadDatabase();
      fs.emptyDir(tempDir);
      ipcRenderer.send('orgmenu.updateSelectBox');
      ipcRenderer.send('alertbox.show', {type: 'tempMessage', msg: 'Settings Imported'});
    },

    /**
     * Backup Settings
     */
    exportSettings: function() {
      let appData = app.getPath('documents');
      const zipPath = path.join(appData, 'opshell_settings.zip');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', function() {
        ipcRenderer.send('alertbox.show', {type: 'message', msg: 'Your settings are now saved in ' + zipPath});
      });

      archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
          ipcRenderer.send('alertbox.show', {type: 'tempMessage', msg: 'Export Error: ' + err.msg});
        } else {
          ipcRenderer.send('alertbox.show', {type: 'tempMessage', msg: 'Export Error: ' + err.msg});
        }
      });

      archive.on('error', function(err) {
        ipcRenderer.send('alertbox.show', {type: 'tempMessage', msg: 'Export Error: ' + err.msg});
      });

      archive.pipe(output);
      appData = app.getPath('home');
      let dirPath = path.join(appData, '.opshell');
      archive.directory(dirPath, 'opshell_export/opshell_keys/');

      appData = app.getPath('userData');
      archive.file(path.join(appData, 'orgs.db'), { name: 'opshell_export/opshell_db/orgs.db' });
      archive.file(path.join(appData, 'temp.db'), { name: 'opshell_export/opshell_db/temp.db' });
      archive.file(path.join(appData, 'aws_regions.db'), { name: 'opshell_export/opshell_db/aws_regions.db' });
      archive.finalize();
    }
  }
};
</script>
<style>
@import url('https://fonts.googleapis.com/css?family=Source+Code+Pro:200,300,400,500,600');
@import '../assets/css/landingpage.css'
</style>
