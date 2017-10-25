import Datastore from 'nedb-promise';
import path from 'path';
import { remote } from 'electron';

export default ({
  orgs: new Datastore({
    autoload: true,
    filename: path.join(remote.app.getPath('userData'), '/orgs.db')
  }),
  awsRegions: new Datastore({
    autoload: true,
    filename: path.join(remote.app.getPath('userData'), '/aws_regions.db')
  }),
  tempData: new Datastore({
    autoload: true,
    filename: path.join(remote.app.getPath('userData'), '/temp.db')
  }),
  googleProjects: new Datastore({
    autoload: true,
    filename: path.join(remote.app.getPath('userData'), 'google_projects.db')
  }),
  cloudServices: new Datastore({
    autoload: true,
    filename: path.join(remote.app.getPath('userData'), '/cloud_services.db')
  }),
  preferences: new Datastore({
    autoload: true,
    filename: path.join(remote.app.getPath('userData'), '/preferences.db')
  })
});
