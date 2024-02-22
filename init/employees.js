let sampleEmployee = [
    {
        name: 'Nilay Kanire',
        email: 'nilaykanire@gmail.com',
        age: 21,
        town: 'Beltarodi',
        city: 'Nagpur',
        permanantAddress: 'Behind Police Station, Beltarodi',
        Division: 'Mihan',
      },
    {
        name: "Mrunmay Chichkhede",
        email:"mchichkhede@gmail.com",
        age: 21,
        town:"Mansar",
        city:"Ramtek",
        permanantAddress: "Behind Police Station, Mansar",
        Division:"Mansar",
        username: "Mrunmay8558",
        password:"Mrunmay@123"
    },
    {
        name: "Nikhil Patil",
        email:"nikhilpatil@gmail.com",
        age: 21,
        town:"Mihan",
        city:"Nagpur",
        permanantAddress: "Behind Police Station, Mihan",
        Division:"Khapri",
        username:"Nikhil_Patil",
    },
]
module.exports ={employees: sampleEmployee };     
    

// app.get("/demo", async (req, res) =>{
//         let fakeUser = new Employee({
//             name: "Nikhil Patil",
//             email:"nikhilpatil@gmail.com",
//             age: 21,
//             town:"Mihan",
//             city:"Nagpur",
//             permanantAddress: "Behind Police Station, Mihan",
//             Division:"Khapri",
//             username:"Nikhil_Patil",
//         })
//     let newUser =  await Employee.register(fakeUser, "------@123");
//     console.log(newUser);
// })