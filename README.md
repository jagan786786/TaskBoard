## TaskBoard Application

Here is my end-to-end Task Management Board for the employee built with react.js, node.js, express.js
for the storing the data mongodb is used to make it responsive and dynamic.

## Features:

The application is useful for the management of the works among the team members where all can work according to the work. In this application I integrated comment part to give feedback about the performance of the assigning task. According to the given comment the assigned developer read the comment carefully and implemented in the task to make it more responsive. The frontend is made using react and hepler ui classes. It have the samrt staus badge to see the status of the task and implemented smooth drag and drop functionality to make the dynamic changes of the task from one board to the other board. It has also advanced filtering based on assignne and priority of the task. The backend is made up of using node.js, express.js and for the database monogDB. The backend consist of RESTful APIs which help to JSON responce using HTTP request and for secure purpose JWT Authentication also implemented. CRUD Operations for  full task and comment management as well as badge logic Server calculated status badges and real-time uupdates  instant data persistence.

## Tecchnologies
-- Frontend - React
-- Backent - Node.js, Express.js and MongoDB

## How to unzip and run

Firstly pull the repository or download the repository from the github and place it in the directory 
where you want to store and perform the task. After completing this in the terminal run this command 
for the backend as well as frontend - 

- cd frontend - **npm install** and cd backend -  **npm install**
- After intalling all the node modules then run npm run dev/bun dev in the terminal to run the project.

## Environmental Variables :

PORT = 4000
DB_CONNECT = YOUR MONGODB URL
JWT_SECRET= YOUR JWT SECRET
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10 (as per the requiremnt)

## Database Design

Here is the total description of collections required for the application to store the data and present it dynamically:

User Collection -                                        Task Collection - 

{                                                        {
  id: ObjectId,                                            id: ObjectId,
  email: String,   //must be unisque                       title: String,       
  passwordHash: String,                                    description: String,
  createdAt: Date                                          priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
}                                                          assigneeId: ObjectId,       ------>                                 //reference of the User Collection
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


