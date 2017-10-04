<template>
  <div id="wrapper">
    <alertBox></alertBox>
    <div class="row" style="margin: 0">
      <leftMenu></leftMenu>
      <orgMenu></orgmenu>
      <mainView></mainView>
    </div>
    <newOrgModal></newOrgModal>
    <orgSettingsModal></orgSettingsModal>
    <regionSettingsModal></regionSettingsModal>
    <cloudSettings></cloudSettings>
  </div>
</template>
<script>
import AlertBox from './AlertBox.vue';
import LeftMenu from './LeftMenu';
import OrgMenu from './OrgMenu';
import NewOrgModal from './modals/NewOrgModal.vue';
import OrgSettingsModal from './modals/OrgSettings.vue';
import RegionSettingsModal from './modals/RegionOptions.vue';
import MainView from './MainView.vue';
import CloudSettings from './modals/CloudSettings.vue';
import { ipcRenderer } from 'electron';

export default {
  name: 'landing-page',
  mounted: async function() {
    ipcRenderer.send('updateOrgSelect');
    const orgCheck = await this.$db.orgs.ccount().exec();
    if (!orgCheck || orgCheck < 1) {
      $('#addOrgModal').modal('show');
    }
  },
  components: {
    LeftMenu, OrgMenu, NewOrgModal, AlertBox, OrgSettingsModal, MainView, RegionSettingsModal, CloudSettings
  },
  methods: {
  }
};
</script>
<style>
@import url('https://fonts.googleapis.com/css?family=Source+Code+Pro:200,300,400,500,600');
@import '../assets/css/landingpage.css'
</style>
