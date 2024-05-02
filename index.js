import express from"express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

const app = express();

mongoose.connect(
    "mongodb://localhost:27017" , {
        dbName: "backend"
    }
).then(
    ()=>{
        console.log("db connected")
    }
).catch(
    ()=>{
        console.log("not able to connect to db")
    }
)



const messageSchema = new mongoose.Schema(
    {
        name : String,
        email : String,
        password : String ,

    }
);

const User = mongoose.model("Users", messageSchema);



let users = [];

app.use(cookieParser());

app.set("view engine","ejs");

app.use(express.urlencoded({extended: true}))

app.use( express.static( path.join(path.resolve(), "public")));

// app.set("views", path.join(path.resolve(), "lappu"))

const IsAuthorised = async (req,res,next)=>{


    const {token} = req.cookies ;

    

   
    if (token){
      

        const decode = jwt.verify( token ,"secretcode");
        
      
        req.user =  await User.findById(decode._id)

        next();
    }
    
    else{
        res.render("index" )

    }
    
        }

// app.set("views" , path.join(path.resolve(), "public"))
app.get(
    "/",IsAuthorised,  (req,res)=>{
        
       console.log(req.user);
            res.render("success", {name: req.user.name}) 
        
  

    });


    app.post(
        "/login", async(req,res)=>{

        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;


        console.log(password);



      

// const  NewUser = User.findOne({email : email});
// if(NewUser  !=  null){
//     console.log(NewUser)
//     console.log("user already registered")
//     res.redirect("/register")

// }

// else{

let user = await User.findOne({email});

if(user == null){
   
   
   
   console.log("register first")

   res.redirect("/register-first");

}


 else {



    // user = await User.create({
    //     name, 
    //     email,
    //     password,

    // })

    if(password  !=  user.password ){

res.send("Passwords Mismatch");
    }


    console.log(user.id, "User id h ")

     const token = jwt.sign({ _id: user._id }, "secretcode");
     console.log(token)


        res.cookie("token", token, {
            httpOnly: true,
            expires : new Date(Date.now() + 60000),
        })



      

    
    

res.redirect("/")
 }
        }
    )





    app.get(
        "/register-first", (req, res)=>{
            res.render("Register")
        }
    )

    
    app.get(
        "/logout", (req,res)=>{

            
            res.clearCookie("token");

            res.redirect("/");
        
        }
    )

 

    app.post(



        "/register", async (req,res)=>{

            const name = req.body.name;
            const email = req.body.email;
            const password = req.body.password;
            const confirmpass = req.body.confirmpass;


            const  encryptpass = await bcrypt.hash(password , 10);


            let user = await User.findOne({email});

            if(user != null){
res.render("Already");
res.redirect("/");
            }


         else{
            const isMatch  = await bcrypt.compare(encryptpass , confirmpass);
            console.log(isMatch);
            
            if(isMatch){

                res.send("Password Mismatch");
            }
 

        
            
            
           else{ user = await User.create({
                name, 
                email,
                password : encryptpass ,
    
            })


            res.redirect("/");}
}

        }
    )


    app.post(
        "/", (req,res)=>{
            if(req.body.firstname == ''){
                res.redirect("failure")
                return;
            }
    else{
        users.push({name : req.body.firstname, lastname : req.body.lastname })
        res.redirect("success")
   
    
return;}

        });


        // app.get(
        //     "/add", (req, res)=>{
        //         Message.create({name :req.query.firstname  , lastname : req.query.lastname}).then(
        //             ()=>{
        //                 res.redirect("success")
        //             }
        //         )
        //     }
        // )


        app.get(
            "/success", (req,res)=>{
        res.render("success")
            }
        );


        app.get(
            "/users", (req,res)=>{
                users.push({name : req.body.firstname, lastname : req.body.lastname })
        res.json({
            users
        });
        
            });

            app.post(
                "/users", (req,res)=>{
                    users.push({name : req.body.firstname, lastname : req.body.lastname })
            res.json({
                users
            });
            
                });

        app.get(
            "/failure", (req,res)=>{
        res.render("failure")
            }
        );
    

// 

app.listen(
    5000, ()=>{
        console.log("Server Started");
    }
)