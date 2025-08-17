## TaskBoard - Team Task Management Application

Here is my end-to-end Task Management Board for the employee built with react.js, node.js, express.js
for the storing the data mongodb is used to make it responsive and dynamic.

## Features:

The application is useful for the management of the works among the team members where all can work according to the work. In this application I integrated comment part to give feedback about the performance of the assigning task. According to the given comment the assigned developer read the comment carefully and implemented in the task to make it more responsive. The frontend is made using react and hepler ui classes. It have the samrt staus badge to see the status of the task and implemented smooth drag and drop functionality to make the dynamic changes of the task from one board to the other board. It has also advanced filtering based on assignne and priority of the task. The backend is made up of using node.js, express.js and for the database monogDB. The backend consist of RESTful APIs which help to JSON responce using HTTP request and for secure purpose JWT Authentication also implemented. CRUD Operations for  full task and comment management as well as badge logic Server calculated status badges and real-time uupdates  instant data persistence.

## TechStack:
-- Frontend - React, TailwindCSS
-- Backend - Node.js, Express.js 
-- Database - MongoDB

### Prerequisites:
- Node.js (v16 or higher)
- npm or yarn

## How to run:
Firstly check that if the node is installed or not in the system then pull the repository or download the repository from the github and place it in the directory 
where you want to store and perform the task. After completing this in the terminal run this command 
for the backend as well as frontend - 

- cd taskboard - **npm install**
- After intalling all the node modules then run npm run dev/bun dev in the terminal to run the project, it helps to run the both frontend and backend. The project run on the "http://localhost:5173".

## Environmental Variables :

PORT = 4000
DB_CONNECT = "YOUR MONGODB URL"
JWT_SECRET= YOUR JWT SECRET
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10 (as per the requiremnt)

## Database Schema

Here is the total description of collections required for the application to store the data and present it dynamically:

User Collection -                                   

{                                                         
    id: ObjectId,
    email: String,   //must be unisque                                                 
    passwordHash: String,                                                     
    createdAt: Date                                                                                        
                                            
}                                                          

Task Collection - 

 {
       id: ObjectId,
       title: String,   
       description: String,
       priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
       assigneeId: ObjectId,    //reference of the User Collection
       status: { type: String, enum: ["Backlog", "In Progress", "Review", "Done"], default: "Backlog" },
       dueDate: Date,
       createdAt: Date,
       updatedAt: Date
 }

  Comments Collection - 

  {
      id: ObjectId,
      taskId: ObjectId,    //refernce of the Task Collection
      authorId: ObjectId,  //refernce of the User Collectio
      body: String,
      createdAt: Date
  }


## API LIST:

http://localhost:4000/api/auth/register
![image_alt](https://github.com/jagan786786/Netflix-clone/blob/3bfaf7d6d508bae1970a896170c972b96e272518/Screenshot%20(458).png)
http://localhost:4000/api/task
![image_alt](https://github.com/jagan786786/Netflix-clone/blob/3bfaf7d6d508bae1970a896170c972b96e272518/Screenshot%20(460).png)
http://localhost:4000/api/task/68a03adb20364ada17c1366f
![image_alt](https://github.com/jagan786786/Netflix-clone/blob/3bfaf7d6d508bae1970a896170c972b96e272518/Screenshot%20(461).png)
http://localhost:4000/api/comment/68a03adb20364ada17c1366f
![image_alt](https://github.com/jagan786786/Netflix-clone/blob/3bfaf7d6d508bae1970a896170c972b96e272518/Screenshot%20(462).png)
http://localhost:4000/api/task/68a21683787a9ed67ab9253c
![image_alt](https://github.com/jagan786786/Netflix-clone/blob/20e805dc19780ba530474340a482ac2f2d805541/Screenshot%20(468).png)


## ScreenShot:

![image alt](https://github.com/jagan786786/TaskBoard/blob/9c7c69292c57bbfc57de384835b9722f01590efb/Screenshot%20(466).png)
![image alt](https://github.com/jagan786786/TaskBoard/blob/9c7c69292c57bbfc57de384835b9722f01590efb/Screenshot%20(467).png))
