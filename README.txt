This app is developed using the MEAN(mongodb,express,angularjs, and nodejs) stack. It is different from what I originally intended in my project proposal because at the time
For my project I used express,body parser, jsonwebtoken, mongoose and morgan for my backend framework. Angular, bootstrap, chartjs, and ngToast for my frontend framework


Setup instruction:
1.You need to install Nodejs and MongoDB on your computer in order to run this application, you can get robomongo for easier account management, but it's not required.
2.After installing nodejs and mongodb, run mongod.exe to start the local server.
3.After starting the server, start a commandline prompt in the root project folder, (shift right click->start commandline here)
4.type in "npm install" and enter, wait for it to finish
5.type "node server.js" and enter, and the app should be ready to go.
6.Access app at http://localhost:3000/

after you installed this software
extract the app.zip file
go to server.js file at line no 13 and replace by this url var url = 'mongodb://localhost/your_data_base_name' 
cd into the folder and open the cmd and then type 'node server.js' 

that's all, if every things goes well your application will be start on this url
http://localhost:3000/
