export function getUserByEmail(users,email){
    
    for (let index = 0; index < users.length; index++) {
        const user = users[index];
        console.log(user,"ssss")
        if(user?.emailAddresses[0]?.emailAddress == email){
            return user
        }
        
    }
    return null;

}