<h1 align="center" id="title">Community Health Worker Support System</h1>

<p id="description">This software system will serve as a comprehensive Community Health Worker Support System (CHWSS) website designed to address critical healthcare challenges faced by pregnant women and community health workers in the Democratic Republic of Congo. The system's primary objective is to provide pregnant women with essential healthcare information and skills necessary during pregnancy and nursing periods and also provide a seamless way for pregnant women to report about their pregnancy so that health workers can start following up early. It will also enable community health workers to effectively communicate with their target communities online especially in situations where personal visits are restricted due to security concerns. Additionally the system will facilitate reporting mechanisms for community health workers to submit their work progress to supervisors allowing for efficient tracking and analysis.</p>

  
  
<h2>🧐 Features</h2>

Here're some of the project's best features:

*   Post CRUD Operation
*   Like Dislike post and follow and unfollow a specific author
*   User Report to Health worker
*   Health worker can forward report to the Admin

<h2>🛠️ Installation Steps:</h2>
<p>Create a new folder</p>

``` cd new folder ```

<p>1. i) Clone Backend repository:</p>

```
git clone https://github.com/Gasorekibo/chw-backend.git
```
<p>1 ii) Clone Frontend repository:</p>

``` 
git clone https://github.com/Gasorekibo/chw-frontend.git
 ``` 

<p>2. Install Dependencies</p>

``` cd backend``` and run ```npm install``` and then 
``` cd frontend``` and run ```npm install```

<p>3. Set up Environment Variables</p>

<p>Create a new file named .env in the root directory and set up your environment variables.</p>

```
MONGODB_URL=
JWT_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_KEY=
GMAIL_PASSWORD=
EMAIL=
 ``` 

  <p>4. Run the application </p>

  Inside backend run ```node app.js```, inside frontend run ```npm start ```
  The app will start on [localhost](http://localost:your_port)
<h2>💻 Built with</h2>

Technologies used in the project:


*   [NodeJs](https://nodejs.org/en/) / [Express](https://expressjs.com/en/guide/routing.html)
*  [MongoDB](https://www.mongodb.com/) / [Mongoose](https://mongoosejs.com/docs/guide.html)
*   [React](https://react.dev/learn) / [Redux toolkit](https://redux-toolkit.js.org/introduction/getting-started)


