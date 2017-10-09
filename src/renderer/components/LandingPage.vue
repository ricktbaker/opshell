<template>
  <div id="wrapper">
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

export default {
  name: 'landing-page',
  mounted: async function() {
    ipcRenderer.on('aboutWindow', () => {
      $('#about').modal('show');
    });
    ipcRenderer.send('orgmenu.updateSelectBox');
    const orgCheck = await this.$db.orgs.ccount().exec();
    if (!orgCheck || orgCheck < 1) {
      ipcRenderer.send('alertbox.show', {type: 'newOrg'});
    }
  },
  components: {
    LeftMenu, OrgMenu, AlertBox, MainView, About
  },
  methods: {
  }
};
</script>
<style>
@import url('https://fonts.googleapis.com/css?family=Source+Code+Pro:200,300,400,500,600');
@import '../assets/css/landingpage.css'
</style>
