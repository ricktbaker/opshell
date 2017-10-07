<template>
  <div class="modal" id="orgSettingsModal" tabindex="-1" role="dialog" aria-labelledby="orgSettingsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header" id="orgSettingsHeader">
          <h5 class="modal-title">{{ org.name }} Settings</h5>
          <i class="fa fa-times-circle-o" arial-label="Close" v-on:click="closeOrgSettings()"></i>
          </a>
        </div>

        <div class="modal-body" id="orgSettingsBody">
          <i v-on:click="toggleCaret('awsRegion')" id="awsRegionSettingsCaret" class="fa fa-caret-right"></i>
          <i v-on:click="addNewRegionModal" class="fa fa-plus-circle pull-right" title="Add New Region"></i>
          <span v-on:click="toggleCaret('awsRegion')" style="cursor: pointer">AWS Regions</span>
          <span>({{awsRegions.length}})</span><br />
          <div id="awsRegionSettingsContent" class="container-fluid">
            <div class="row">
              <div :id="'card' + awsRegion.region" v-for="awsRegion in awsRegions" v-bind:key="awsRegion.region" class="col-sm-6 regionCard">
                <div class="card">
                  <div class="card-header">
                    {{ awsRegion.region }}
                    <i :id="'cancel' + awsRegion.region" v-on:click="toggleEdit(awsRegion)" class="fa fa-times-circle-o pull-right" style="display: none" title="Cancel"></i>
                    <i v-on:click="toggleEdit(awsRegion,'keys')" class="fa fa-key pull-right" title="Manage SSH Keys"></i>
                    <i v-on:click="toggleEdit(awsRegion,'settings')" class="fa fa-edit pull-right" title="Edit Region Settings"></i>
                  </div>

                  <div class="card-block">
                    <div :id="'settings' + awsRegion.region" style="display: none">
                      <form>
                        <div class="form-group">
                          <label for="accessKey" class="col-sm col-form-label">
                            AWS Access Key Id
                            <i class="fa fa-question-circle-o" title="This access key must have the ec2:describeInstances permission"></i>
                          </label>
                          <div class="col-sm-12">
                            <input type="text" class="form-control input-sm" v-model="awsRegion.accessKey" placeholder="Access Key Id">
                          </div>
                          <label for="accessKey" class="col-sm col-form-label">
                            AWS Secret Key
                          </label>
                          <div class="col-sm-12">
                            <input type="text" class="form-control input-sm" v-model="awsRegion.secretKey" placeholder="Access Key Id">
                          </div>
                          <label for="accessKey" class="col-sm col-form-label">
                            Default SSH User
                          </label>
                          <div class="col-sm-12">
                            <select class="userSelect form-control" v-model="awsRegion.defaultUser">
                              <option v-for="user in awsUsers" :value="user" :key="user">{{ user }}</option>
                            </select>
                          </div>
                        </div>
                        <button v-on:click="updateAwsRegions(awsRegion)" type="button" class="btn btn-primary btn-sm pull-right">
                          <span :id="'check' + awsRegion.region" class="fa fa-check" style="display: none; color: #7FFF00"></span>
                          Update Credentials
                        </button>
                        <button v-on:click="deleteRegion(awsRegion)" type="button" style="margin-right: 10px;" class="btn btn-danger btn-sm pull-right">
                          Delete Region
                        </button>
                      </form>
                    </div>

                    <div :id="'keys' + awsRegion.region" style="display: none">
                      AWS SSH Keys
                      <button v-on:click="scanRegion(awsRegion)" style="padding: 2px 5px" class="pull-right btn btn-sm btn-primary">
                        <i :id="'scan' + awsRegion.region" style="display: none" class="fa fa-spinner fa-spin fa-fw"></i>
                        Scan Region for Required Keys
                      </button>

                      <table class="keystable table table-sm table-condensed table-striped">
                        <thead>
                          <tr>
                            <th>Key Name</th>
                            <th>Imported</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="key in awsRegion.keys" v-bind:key="key.keyName">
                            <td>{{ key.keyName }}</td>
                            <td>
                              {{ key.value ? 'Yes' : 'No'}}
                              <label class="btn btn-success btn-sm btn-file pull-right">
                                <span v-if="!key.value">Import Key</span>
                                <span v-else>Update Key</span>
                                <input type="file" @change="onFileChange($event, awsRegion, key.keyName)" style="display: none;">
                              </label>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div id="keyError"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="addNew">
            <div id="awsRegionNew">
              <form>
                <div class="form-group row">
                  <label for="example-text-input" class="col-4 col-form-label">Region</label>
                  <div class="col-7">
                    <select id="awsRegionId" class="custom-select form-control" name="awsRegion" vmodel="selectedRegion">
                      <option v-for="awsRegion in awsRegionCodes" :value="awsRegion.code" :key="awsRegion.code">{{ awsRegion.code }} : {{ awsRegion.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="form-group row">
                  <label for="example-search-input" class="col-4 col-form-label">AWS Access Key Id</label>
                  <div class="col-7">
                    <input class="form-control form-conrol-sm" type="text" value="" id="awsAccessKey">
                  </div>
                </div>
                <div class="form-group row">
                  <label for="example-email-input" class="col-4 col-form-label">AWS Secret Key</label>
                  <div class="col-7">
                    <input class="form-control form-conrol-sm" type="text" value="" id="awsSecretKey">
                  </div>
                </div>
                <div class="form-group row">
                  <label for="" class="col-4 col-form-label">Default SSH User</label>
                  <div class="col-7">
                    <select class="userSelect form-control" id="awsDefaultUser">
                      <option v-for="user in awsUsers" :value="user" :key="user">{{ user }}</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4 text-center">
                  <button type="button" class="btn btn-primary btn-sm" v-on:click="addAWSRegion">Submit</button>
                  <button type="button" class="btn btn-sm" v-on:click="cancelNew">Cancel</button>
                </div>
              </form>
            </div>
          </div>
          <div class="text-center">
            <button class="btn btn-danger btn-sm" v-on:click="deleteOrg()">Delete this Organization</button>
          </div>
        </div>
        <div class="modal-footer">
          <i class="fa fa-hand-stop-o"></i>
          </a> &nbsp; Organization already exists! &nbsp; &nbsp;
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import _ from 'lodash';
import AWS from 'aws-sdk';
import fs from 'fs-extra';
import path from 'path';

const { app } = require('electron').remote;
export default {
  name: 'orgSettingsModal',
  data: function() {
    return {
      org: {},
      awsRegions: [],
      awsUsers: [
        'ec2-user',
        'ubuntu',
        'centos',
        'root'
      ],
      awsRegionCodes: [
        {
          code: 'us-east-1',
          name: 'US East (N. Virginia)'
        },
        {
          code: 'us-east-2',
          name: 'US East (Ohio)'
        },
        {
          code: 'us-west-1',
          name: 'US West (N. California)'
        },
        {
          code: 'us-west-2',
          name: 'US West (Orgegon)'
        },
        {
          code: 'ca-central-1',
          name: 'Canada (Central)'
        },
        {
          code: 'eu-west-1',
          name: 'EU (Ireland)'
        },
        {
          code: 'eu-west-2',
          name: 'EU (London)'
        },
        {
          code: 'eu-central-1',
          name: 'EU (Frankfurt)'
        },
        {
          code: 'ap-northeast-1',
          name: 'Asia Pacific (Tokyo)'
        },
        {
          code: 'ap-northeast-2',
          name: 'Asia Pacific (Seoul)'
        },
        {
          code: 'ap-southeast-1',
          name: 'Asia Pacific (Singapore)'
        },
        {
          code: 'ap-southeast-2',
          name: 'Asia Pacific (Syndey)'
        },
        {
          code: 'ap-south-1',
          name: 'Asia Pacific (Mumbai)'
        },
        {
          code: 'sa-east-1',
          name: 'South America (São Paulo)'
        }
      ]
    };
  },
  mounted: function() {
    $('#awsRegionNew').hide();
    $('#awsRegionSettingsContent').hide();
    ipcRenderer.on('orgSettings', async (e, orgId) => {
      try {
        this.org = await this.$db.orgs.cfindOne({ _id: orgId }).exec();
        this.awsRegions = await this.$db.awsRegions.cfind({ org: orgId }).exec();
      } catch (err) {
        console.log(err);
      }
      $('#orgSettingsModal').modal('show');
    });
  },
  methods: {
    async onFileChange(e, awsRegion, keyName) {
      try {
        var files = e.target.files || e.dataTransfer.files;
        if (!files.length) return;
        const appData = app.getPath('home');
        const dirPath = path.join(appData, '.opshell', this.org.name, awsRegion.region).replace(/\s+/g, '-');
        const fullPath = path.join(dirPath, keyName);
        const data = await fs.readFile(files[0].path);
        await fs.ensureDir(dirPath);
        await fs.writeFile(fullPath, data);
        await fs.chmod(fullPath, '0600');
        awsRegion.keys.some(function(el) {
          if (keyName === el.keyName) {
            el.value = true;
          }
        });
        await this.$db.awsRegions.update({ _id: awsRegion._id }, awsRegion);
      } catch (err) {
        console.log(err);
      }
    },
    toggleEdit: function(awsRegion, type) {
      if (type) {
        if ($('#card' + awsRegion.region).hasClass('col-sm-6')) {
          $('#card' + awsRegion.region).removeClass('col-sm-6').addClass('col-sm-12');
        }
        $('#cancel' + awsRegion.region).show();
        if (type === 'settings') {
          $('#settings' + awsRegion.region).show();
          $('#keys' + awsRegion.region).hide();
        } else if (type === 'keys') {
          $('#keys' + awsRegion.region).show();
          $('#settings' + awsRegion.region).hide();
        }
      } else {
        $('#card' + awsRegion.region).removeClass('col-sm-12').addClass('col-sm-6');
        $('#cancel' + awsRegion.region).hide();
        $('#settings' + awsRegion.region).hide();
        $('#keys' + awsRegion.region).hide();
      }
    },
    updateAwsRegions: async function(awsRegion) {
      await this.$db.orgs.update({ _id: this.org._id }, this.org);
      ipcRenderer.send('updateMenuOrg');
      $('#check' + awsRegion.region).show();
      setTimeout(function() {
        $('#check' + awsRegion.region).fadeOut('slow');
      }, 2000);
    },
    toggleCaret: function(type, force) {
      if (($('#' + type + 'SettingsCaret').hasClass('fa-caret-right') && force !== 'close') || force === 'open') {
        $('#' + type + 'SettingsCaret').removeClass('fa-caret-right').addClass('fa-caret-down');
        $('#' + type + 'SettingsContent').show();
      } else {
        $('#' + type + 'SettingsCaret').removeClass('fa-caret-down').addClass('fa-caret-right');
        $('#' + type + 'SettingsContent').hide();
      }
    },
    deleteRegion: async function(awsRegion) {
      if (confirm('Are you sure you want to delete this region?  All associated SSH keys will be purged.')) {
        this.$db.awsRegions.remove({ _id: awsRegion._id });
        const appData = app.getPath('home');
        const dirPath = path.join(appData, '.opshell', this.org.name, awsRegion.region).replace(/\s+/g, '-');
        fs.emptyDir(dirPath);
        ipcRenderer.send('updateMenuOrg');
        ipcRenderer.send('orgSettings', this.org._id);
      } else {
        return false;
      }
    },
    deleteOrg: async function() {
      if (confirm('Are you sure you want to delete this Organization?  All associated regions and SSH keys will be purged.')) {
        this.$db.awsRegions.remove({org: this.org._id}, {multi: true});
        this.$db.orgs.remove({_id: this.org._id});
        const appData = app.getPath('home');
        const dirPath = path.join(appData, '.opshell', this.org.name).replace(/\s+/g, '-');
        fs.emptyDir(dirPath);
        ipcRenderer.send('updateOrgSelect');
        $('#orgSettingsModal').modal('hide');
      } else {
        return false;
      }
    },
    scanRegion: function(awsRegion) {
      $('#keyError').html('');
      const vue = this;
      $('#scan' + awsRegion.region).show();
      AWS.config.update({
        region: awsRegion.region,
        accessKeyId: awsRegion.accessKey,
        secretAccessKey: awsRegion.secretKey
      });

      const ec2 = new AWS.EC2();
      ec2.describeInstances(async function(err, data) {
        if (err) {
          $('#keyError').html(err.message);
          $('#scan' + awsRegion.region).hide();
        } else {
          if (!Array.isArray(awsRegion.keys)) {
            awsRegion.keys = [];
          }
          _.each(data.Reservations, (reservationData) => {
            _.each(reservationData.Instances, (instanceData) => {
              if (!_.includes(awsRegion.keys, instanceData.KeyName)) {
                const found = awsRegion.keys.some(function(el) {
                  if (instanceData.KeyName === el.keyName) return true;
                });
                if (!found) {
                  awsRegion.keys.push({ keyName: instanceData.KeyName, value: null });
                }
              }
            });
          });
          await vue.$db.awsRegions.update({ _id: awsRegion._id }, awsRegion);
          this.awsRegion = awsRegion;
          ipcRenderer.send('orgSettings', vue.org._id);
          $('#scan' + awsRegion.region).hide();
        }
      });
    },
    addAWSRegion: async function() {
      const awsRegion = $('#awsRegionId').val();
      const accessKey = $('#awsAccessKey').val();
      const secretKey = $('#awsSecretKey').val();
      const defaultUser = $('#awsDefaultUser').val();

      const awsRegionObj = {
        org: this.org._id,
        region: awsRegion,
        accessKey: accessKey,
        secretKey: secretKey,
        defaultUser: defaultUser
      };

      const newRegion = await this.$db.awsRegions.insert(awsRegionObj);
      ipcRenderer.send('updateMenuOrg');
      ipcRenderer.send('orgSettings', this.org._id);
      this.toggleCaret('awsRegion', 'open');
      setTimeout(() => {
        this.toggleEdit(newRegion, 'keys');
      }, 1000);
      this.cancelNew();
    },
    addNewRegionModal: function() {
      $('#awsRegionNew').show();
    },
    cancelNew: function() {
      $('#awsRegionNew').hide();
    },
    closeOrgSettings: function() {
      $('#orgSettingsModal').modal('hide');
      this.toggleCaret('awsRegion', 'close');
    }
  }
};
</script>

<style>
@import '../../assets/css/orgsettings.css'
</style>
