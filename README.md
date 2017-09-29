# devops_helper

> Devops Helper

This project is meant to help those that work with a number of AWS accounts.   Always having to login to the console to find the server you want to connect to, if you need to use a bastion host, what key you need to use, etc.

This is still very early in the development phase, and has been developed on a Mac, so your mileage may vary on other platforms.



#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build
```

#### What is working thus far

Add your AWS access keys per region (only needs ec2.describeInstances currently)

![Access Keys](screenshots/access_keys.png "Add access keys per region, only requires ec2:describeInstances currently")
