<template>
  <div id="getting-started">
    Note: Windows Users will need to have OpenSSH Client (http://www.mls-software.com/opensshd.html) installed and SSH command will need to be in your PATH.
    <p>
    <h5>Add Organization</h5>
    - Click the <i class='fa fa-building-o'></i> icon in the left menu<br />
    - Add an Organization by clicking the <i class='fa fa-plus'></i> icon.<br />
    - Enter your Organization name and "Add Org"<br />
    </p><p>
    <h5>Add an AWS Region</h5>
    - Click the "Add Region" button.<br />
    - Select the region where your AWS servers are located, and click "Add Region".<br />
    - Enter your AWS Access Keys (these keys will need to have the ec2.describeInstances permission).<br />
    - Default SSH User will be the default user selected from the user list when you want to SSH to a server.<br />
    </p><p>
    <h5>Add SSH Keys</h5>
    - Click the "Keys" button within the Region.<br />
    - Scan Region for Required Keys will scan all of your instances to look for the default SSH key required for access.<br />
    - Next to each key, you can click the "Import Key" button.<br />
    - Find the ssh key on your computer for that key and open.<br />
    </p><p>
    <h5>Add Custom Users</h5>
    - Click the "Users" button within the Region.<br />
    - In the "Enter New User" input field, enter the username and then click "Add User"<br />
    - You can then Import the SSH key associated with that user, or leave it blank for password authentication<br />
    </p><p>
    <h5>Adding a Bastion Host</h5>
    - If you need to access your servers through a bastion host select "Settings" button within the Region.<br />
    - Check "Use Bastion Host"
    - Select the Host and the User to connect as and then click "Save Settings"
    </p><p>
    <h5>List servers in a Region</h5>
    - Click the <i class='fa fa-building-o'></i> icon in the left menu<br />
    - Select the Organization<br />
    - Click the Region you want to list.
    - A new tab will open with your instances listed.
    </p><p>
    <h5>SSH to an server</h5>
    - Click the Server you want to SSH to in the Region tab.<br />
    - Select the User and IP to connect to.<br />
    - Click the "Open SSH Button" to open a new tab with the SSH connection.
  </div>
</template>

<script>
export default {
  name: 'gettingStarted',
  data: function() {
    return {
    };
  },
  mounted: async function () {
    await this.$db.tempData.update({type: 'intro'}, {type: 'intro', seen: true}, {upsert: true});
  },
  methods: {
  }
};
</script>
<style>
@import '../../assets/css/gettingstarted.css'
</style>
