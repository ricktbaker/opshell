<template>
  <div class="col" id="mainView">
    <ul class="nav nav-tabs" role="tablist" id="tabs" v-bind:class="{'tabs-background':tabs.length > 0}">
      <li v-for="tab in tabs" class="nav-item" v-bind:key="tab.id">
        <a class="nav-link" role="tab" :href="'#tab' + tab.id" data-toggle="tab">
          <table class="navtable">
            <tr>
              <td class="tabicon">
                 <i :class="'fa ' + tab.icon"></i>
              </td>
              <td class="tabname">
                <span>
                  {{ tab.org }}
                </span>
                <br />
                <span>
                  {{ tab.name }}
                </span>
              </td>
              <td class="tabicon">
                <i v-on:click="closeTab(tab.id)" class="fa fa-close"></i>
              </td>
            </tr>
          </table>
        </a>
      </li>
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
      <div v-for="tab in tabs" v-bind:key="tab.id" role="tabpanel" class="tab-pane fade" :id="'tab' + tab.id">
        <cloudService v-if="tab.type === 'cloudService'"></cloudService>
        <sshConnection v-if="tab.type === 'ssh'" class="sshterm"></sshConnection>
        <orgSettings v-if="tab.type === 'orgSettings'"></orgSettings>
        <whatsNew v-if="tab.type === 'whatsNew'"></whatsNew>
        <gettingStarted v-if="tab.type === 'gettingStarted'"></gettingStarted>
      </div>
    </div>
  </div>
</template>

<script>

import { ipcRenderer } from 'electron';
import CloudService from './tabs/CloudService.vue';
import SshConnection from './tabs/SshConnection.vue';
import OrgSettings from './tabs/OrgSettings.vue';
import WhatsNew from './tabs/WhatsNew.vue';
import GettingStarted from './tabs/GettingStarted.vue';
import compareVersion from 'compare-versions';

export default {
  name: 'mainView',
  data: function() {
    return {
      tabs: [],
      tabCount: 0,
      type: null
    };
  },
  mounted: async function() {
    ipcRenderer.on('mainview.closeTab', (e, tabId) => {
      this.closeTab(tabId);
    });
    ipcRenderer.on('mainview.openTab', async (e, data) => {
      const org = await this.$db.orgs.cfindOne({ _id: data.org }).exec();
      const cloudService = await this.$db.cloudServices.cfindOne({_id: data.cloudId}).exec();
      const obj = {
        id: this.tabCount,
        type: data.type,
        tab: this.tabCount
      };
      if (data.type === 'cloudService') {
        obj.org = org.name;
        obj.name = cloudService.identifier;
        obj.icon = 'fa-cloud';
      } else if (data.type === 'ssh') {
        obj.org = org.name;
        obj.name = data.instance.name;
        obj.icon = 'fa-server';
      } else if (data.type === 'orgSettings') {
        obj.org = org.name;
        obj.name = 'Settings';
        obj.icon = 'fa-cog';
      } else if (data.type === 'whatsNew') {
        obj.org = 'Opshell';
        obj.name = 'What\'s New';
        obj.icon = 'fa-bullhorn';
      } else if (data.type === 'gettingStarted') {
        obj.org = 'Opshell';
        obj.name = 'Getting Started';
        obj.icon = 'fa-info';
      }
      this.tabs.push(obj);
      setTimeout(() => {
        $('.nav-tabs a:last').tab('show');
      }, 1000);

      data.tab = this.tabCount;
      this.tabCount += 1;

      if (data.type === 'cloudService') {
        ipcRenderer.send('cloudservice.data', data);
      } else if (data.type === 'ssh') {
        ipcRenderer.send('sshconnection.doSsh', data);
      } else if (data.type === 'orgSettings') {
        ipcRenderer.send('orgsettings.loadData', data);
      }
    });

    // Should we display the whats new tab or the getting started tab?
    const temp = await this.$db.preferences.cfindOne({type: 'intro'}).exec();
    if (temp && temp.seen) {
      var pjson = require('../../../package.json');

      const temp = await this.$db.preferences.cfindOne({type: 'whatsnew'}).exec();

      let seenVersion;
      if (!temp) {
        seenVersion = '0';
      } else {
        seenVersion = temp.version;
      }

      if (compareVersion(pjson.version, seenVersion) > 0) {
        const data = {};
        data.type = 'whatsNew';
        ipcRenderer.send('mainview.openTab', data);
      }
    } else {
      const data = {};
      data.type = 'gettingStarted';
      ipcRenderer.send('mainview.openTab', data);
    }
  },
  components: {
    CloudService, SshConnection, OrgSettings, WhatsNew, GettingStarted
  },
  methods: {
    /**
     * Close out tab
     */
    closeTab: function(tabId) {
      if (this.tabs.length === 1) {
        this.tabs = [];
      } else {
        this.tabs = this.tabs.filter(function(tab) {
          return tab.id !== tabId;
        });
      }
      setTimeout(() => {
        $('.nav-tabs a:last').tab('show');
      }, 1000);
    }
  }
};
</script>
<style>
@import '../assets/css/mainview.css'
</style>
