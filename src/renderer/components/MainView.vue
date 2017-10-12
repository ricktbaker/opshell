<template>
  <div class="col" id="mainView">
    <ul class="nav nav-tabs" role="tablist" id="tabs" v-bind:class="{'tabs-background':tabs.length}">
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
        <awsRegion v-if="tab.type === 'awsRegion'"></awsRegion>
        <sshConnection v-if="tab.type === 'ssh'" class="sshterm"></sshConnection>
        <orgSettings v-if="tab.type === 'orgSettings'"></orgSettings>
        <whatsNew v-if="tab.type === 'whatsNew'"></whatsNew>
      </div>
    </div>
  </div>
</template>

<script>

import { ipcRenderer } from 'electron';
import AwsRegion from './tabs/AwsRegion.vue';
import SshConnection from './tabs/SshConnection.vue';
import OrgSettings from './tabs/OrgSettings.vue';
import WhatsNew from './tabs/WhatsNew.vue';
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
    /**
     * Open up a tab of the proper type
     */
    ipcRenderer.on('mainview.closeTab', (e, tabId) => {
      this.closeTab(tabId);
    });
    ipcRenderer.on('mainview.openTab', async (e, data) => {
      const org = await this.$db.orgs.cfindOne({ _id: data.org }).exec();
      const awsRegion = await this.$db.awsRegions.cfindOne({_id: data.awsRegion}).exec();
      const obj = {
        id: this.tabCount,
        type: data.type,
        tab: this.tabCount
      };
      if (data.type === 'awsRegion') {
        obj.org = org.name;
        obj.name = awsRegion.region;
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
        obj.icon = 'fa-newspaper-o';
      }
      this.tabs.push(obj);
      setTimeout(() => {
        $('.nav-tabs a:last').tab('show');
      }, 1000);

      data.tab = this.tabCount;
      this.tabCount += 1;

      if (data.type === 'awsRegion') {
        ipcRenderer.send('awsregion.regionData', data);
      } else if (data.type === 'ssh') {
        ipcRenderer.send('sshconnection.doSsh', data);
      } else if (data.type === 'orgSettings') {
        ipcRenderer.send('orgsettings.loadData', data);
      }
    });

    // Should we display the whats new tab?
    var pjson = require('../../../package.json');

    const temp = await this.$db.tempData.cfindOne({type: 'whatsnew'}).exec();

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
  },
  components: {
    AwsRegion, SshConnection, OrgSettings, WhatsNew
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
