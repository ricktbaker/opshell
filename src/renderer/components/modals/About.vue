<template>
  <div class="modal" id="about" tabindex="-1" role="dialog" aria-labelledby="aboutLabel" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">About Opshell</h5>
          <i class="fa fa-times-circle-o" style="cursor: pointer; padding: 3px 0" arial-label="Close" data-dismiss="modal"></i>
          </a>
        </div>
        <div class="modal-body">
          <table>
            <tr>
              <td><img src="../../assets/256x256.png" /></td>
              <td>
                Author:<br />
                Version:<br />
              </td>
              <td>
                Rick Baker</br>
                {{ version }}</br>
              </td>
            </tr>
          </table>
          <div class="text-center">
            Copyright &copy; Rick Baker 2017
            <button v-on:click="home()" class="btn btn-sm btn-success">
              <i class="fa fa-anchor"> Opshell Home</i>
            </button>

            <button v-on:click="github()" class="btn btn-sm btn-success">
              <i class="fa fa-github"> Bugs, Features</i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {shell} from 'electron';
export default {
  name: 'about',
  data: function() {
    return {
      version: null
    };
  },
  mounted: function() {
    var pjson = require('../../../../package.json');
    this.version = pjson.version;
  },
  methods: {
    home: () => {
      shell.openExternal('http://opshell.ricktbaker.com');
    },
    github: () => {
      shell.openExternal('https://github.com/ricktbaker/opshell/issues');
    }
  }
};
</script>

<style>
@import '../../assets/css/about.css'
</style>
