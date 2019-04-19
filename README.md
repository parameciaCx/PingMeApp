# PingMeApp

This application pings a user on the site every so often, prompting them for their current activity. The user can add choose an activity from an existing list of tags, or submit an application for a new tag, that can be approved by users of a higher level (e.g. staff, admin). The user can see a visualization of their activities, and can also see the activities of the entire user base as a whole. 

## Getting Started

### Prerequisites

What things you need to install the software and how to install them

```
Nodejs
MongoDB
```

### Installing


1.After installing nodejs and mongodb, run mongod.exe to start the local server.

2.After starting the server, start a commandline prompt in the root project folder, (shift right click > start commandline here)

3.type in "npm install" and enter, wait for it to finish

4.type "node server.js" and enter, and the app should be ready to go.

5.Access app at http://localhost:3000/


## Built With

### Back-end

 - Express
 - Body parser
 - JWT
 - Mongoose
 - Morgan

### Front-end

 - Angular
 - bootstrap
 - charjs
 - ngToast

## In Development

* Friend feature, allows users to communicate
* Tweets (friends or public)
