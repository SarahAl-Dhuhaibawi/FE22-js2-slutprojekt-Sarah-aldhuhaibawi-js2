//Get elements
const body = document.getElementById("body") as HTMLBodyElement;
const header = document.getElementById("header") as HTMLElement | null;
const loginfield = document.getElementById("login")as HTMLButtonElement | null;
const form = document.getElementById("form") as HTMLFormElement | null;
const usernameInput = document.getElementById("username") as HTMLInputElement | null;
const passwordInput = document.getElementById("password") as HTMLInputElement | null;
const imageSelection = document.getElementById("image-selection") as HTMLSelectElement | null;
const createAccountButton = document.getElementById("create-account-button") as HTMLButtonElement | null;
const logInButton = document.getElementById("log-in-button") as HTMLButtonElement | null;
const loggedInUsersList = document.getElementById("logged-in-users") as HTMLUListElement | null;

const baseUrl = "https://slutprojekt-social-media-default-rtdb.europe-west1.firebasedatabase.app/";
//create elements
const errorMessage = document.createElement("p");
const userDeletedSuccessfully = document.createElement("h1");
const failedToDeleteUser = document.createElement("h1");
const statusInput = document.createElement("input");
const listItem = document.createElement("li");
const accountCreated = document.createElement("h2");
body.appendChild(accountCreated);
const logInpage = document.createElement('div');
document.body.appendChild(logInpage);
let loggedInUser = null; 


// Define the interfaces
interface UserInfo {
    userName: any;
    password: string;
    status: string;
    imageurl: string;
    newUser: boolean;
    createdAt: string
}

interface FirebaseResponse {
    [key: string]: UserInfo;
}

//uppdate and save users 
async function saveUser(user: UserInfo): Promise<void> {

    const arrData = await getUsers();

    const url = `${baseUrl}users/${user.userName}.json`;
    const init = {
        method: "PUT",
        body: JSON.stringify(user),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    };

    try {
        const response = await fetch(url, init);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
    } catch (err) {
        console.log(err);
        throw new Error("Failed to save user information.");
    }
}

//Event listener for select image
if (imageSelection) {
    imageSelection.addEventListener("change", () => {
        const selectedImageUrl = imageSelection.value;
        imageSelection.value = selectedImageUrl;
    });
} else {
    console.error("Image element not found.");
}

//Function to get the users
async function getUsers(): Promise<UserInfo[]> {
    try {
        const response = await fetch(`${baseUrl}users.json`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const users: FirebaseResponse | null = await response.json();
        if (!users) {

            return [];
        }

        const usersArray: UserInfo[] = Object.values(users);

        return usersArray;

    } catch (err) {

        throw new Error("Failed to fetch users");
    }
}

// Event listener for the "create account" button
if (createAccountButton && usernameInput && passwordInput) {
    createAccountButton.addEventListener("click", async () => {
        userDeletedSuccessfully.textContent = " ";
        errorMessage.innerText = " ";
        const userName = usernameInput.value;
        const password = passwordInput.value;

        if (!userName || !password) {
            errorMessage.textContent = "Username and / or password cannot be empty.";
            errorMessage.style.color = "red";
            createAccountButton.insertAdjacentElement("afterend", errorMessage);
            return;
        }

        //check if username is available
        const isAvailable = await isUsernameAvailable(userName);
        if (!isAvailable) {
            errorMessage.textContent = "Username is already taken. Please choose another one.";
            errorMessage.style.color = "red";
            createAccountButton.insertAdjacentElement("afterend", errorMessage);
            return;
        }
        accountCreated.textContent = "Your account has been successfully created! Now  you can log in with your new account.";
        accountCreated.style.color = "green";
        
        const userInfo: UserInfo = {
            userName: userName,
            password: password,
            status: "",
            imageurl: imageSelection?.value ?? "",
            newUser: true,
            createdAt: new Date().toISOString()
        };

        await saveUser(userInfo);
    });
} else {
    console.error("Cant finnd one or more elements");
}

//control username checks if there's any user in the array with same username 
async function isUsernameAvailable(username: string): Promise<boolean> {
    const users = await getUsers();
    return !users.some((user) => user.userName === username);
}

// Displaying logged in users
function displayLoggedInUsers(users: UserInfo[]): void {
    let arr: UserInfo[] = []

     Object.values(users).forEach((user) => arr.push(user))

    let newArr = arr.sort((a, b) => {
          {return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()}
    })

    if (!loggedInUsersList) {
        console.error("Logged-in users list not found.");
        return;
    }

    loggedInUsersList.innerHTML = "";
    //loop.......................
    //loginpage.inside
    newArr.forEach((user: UserInfo, i) => {
        Object.values(user.status).forEach((status) => {
            if (!user.newUser) {
                    const listItem = document.createElement("li");
                    listItem.textContent = `${user.userName}s Status: ${status}`;
                    loggedInUsersList.appendChild(listItem);
                    body.style.backgroundColor = "#ccc";
        
                    // Create an img element in profile user picture which is in the list in log in page
                    const userImage = document.createElement("img");
                    userImage.src = user.imageurl;
                    userImage.style.width = "50px";
                    userImage.style.height = "50px";
                    userImage.style.borderRadius = "5rem";
                    listItem.appendChild(userImage);

                    // Event listener to the list 
                    listItem.addEventListener("click", () => {
                        console.log(user)
                        document.body.innerHTML = "";
                        loginfield!.style.display ="none";
                        // // form!.style.display = "none";
                        const usersPage = document.createElement('div');
                        usersPage.innerHTML = `<h2>Welcome to ${user.userName}'s page! </br> Status: ${Object.values(user.status)}</h2>`;
                        document.body.appendChild(usersPage);
                        body.style.backgroundColor = "yellow";
                        body.style.color = "#333";
                        body.style.textAlign ="center";
        
                         // Create an img element in visiting user page
                        const userImage = document.createElement("img");
                        userImage.src = user.imageurl;
                        userImage.style.width = "90px";
                        userImage.style.height = "90px";
                        userImage.style.borderRadius = "5rem";
                        usersPage.appendChild(userImage);
        
                        //Log out button to log out user and take user back to login page 
                        const logOutButton = document.createElement('button');
                        logOutButton.textContent = "Log Out";
                        logOutButton.style.textAlign = "center";
                        logOutButton.style.backgroundColor = "#333";
                        logOutButton.style.color = "white";
                        logOutButton.style.padding = "10px";
                        logOutButton.style.margin = "10px";
                        document.body.appendChild(logOutButton);

                        logOutButton.addEventListener("click", backToMainPage);
                        
                        function backToMainPage() {
                        
                            window.location.href = "./index.html";
                        }
                    })
                }
            
        })
    
    })
}

if (logInButton && usernameInput && passwordInput) {
    logInButton.addEventListener("click", async (event: MouseEvent) => {
        event.preventDefault();
        accountCreated.textContent = " ";
        userDeletedSuccessfully.textContent = " ";
        document.body.style.alignContent = "center";
        errorMessage.textContent = " ";
        const password = passwordInput.value;
        const users = await getUsers();
        const user = users.find((u) => u.userName === usernameInput.value);
        errorMessage.textContent = "The account has been Successfully logged in! ";
        
        //if no user is found
        if (!user) {
            errorMessage.textContent = "There is no account found for this user. Please create an account first.";
            errorMessage.style.color = "red";
            form?.appendChild(errorMessage);
            return;
        }
        //password check
        if (user.password !== password) {
            errorMessage.textContent = "Incorrect password. Please try again.";
            errorMessage.style.color = "red";
            form?.appendChild(errorMessage);
            return;
        }

        // Update the user's status
        user.newUser = false;
        await saveUser(user);

        // Display logged-in users
        displayLoggedInUsers(await getUsers());

        logInpage.innerHTML = `<h1>Welcome ${usernameInput.value}!</h1> `;
        loginfield!.style.display ="none";
        const userImage = document.createElement("img");
            userImage.src = user.imageurl;
            userImage.style.width = "200px";
            userImage.style.height = "30%";
            userImage.style.borderRadius = "5rem";
            logInpage.appendChild(userImage);
        logInpage.style.textAlign = "center";

        //status
        const statuslabel = document.createElement("p");
        logInpage.appendChild(statuslabel);
        statuslabel.textContent =" Write your status here:";
        logInpage.appendChild(statusInput);
        logInpage.appendChild(loggedInUsersList!)
        loggedInUsersList!.style.display = "block";
        statusInput.style.display = "block";
        statusInput.value = "";
        statusInput.id = "status";
        statusInput.classList.add('status-input');
        
        //create button to post the status to the user in the list/firebase
        const postStatusButton = document.createElement('button');
        postStatusButton.innerText = "Post Status";
        logInpage.appendChild(postStatusButton);
        postStatusButton.classList.add('post-status-button');
        
        //Eventlistener to post the status to the user
        postStatusButton.addEventListener("click", async () => {
            const status = statusInput.value;
        
            const url = `${baseUrl}users/${user.userName}/status.json`;
            const init = {
                method: "POST",
                body: JSON.stringify(status),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            };
            try {
                const response = await fetch(url, init);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
            } catch (err) {
                console.log(err);
                throw new Error("Failed to save user information.");
            }

            // Display logged-in users
            displayLoggedInUsers(await getUsers());
            statusInput.value = "";
        });

         //create button to delete user 
        const deleteUserButton = document.createElement('button');
        deleteUserButton.innerText = "Delete User";
        deleteUserButton.style.textAlign = "center";
        deleteUserButton.style.backgroundColor ="rgb(203, 58, 58)";
        deleteUserButton.style.margin = "10px";
        deleteUserButton.style.padding = "10px";
        logInpage.appendChild(deleteUserButton);
        
        deleteUserButton?.addEventListener("click", async (event) => {
            event?.preventDefault();
            listItem.textContent = " ";
            
            if (usernameInput) {
                await deleteUser(usernameInput.value);
                errorMessage.textContent = " ";
            } else {
                console.error("Username input element not found.");
            }
        });

        async function deleteUser(username: string): Promise<void> {
            console.log("Deleting user");
            const url = `${baseUrl}users/${username}.json`;
            const init = {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            };

            try {
                const response = await fetch(url, init);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                console.log("User deleted successfully");
                userDeletedSuccessfully.textContent = "This users account has been successfully deleted!"
                document.body.appendChild(userDeletedSuccessfully);
                displayLoggedInUsers(await getUsers());

                //takes away the logged in page and back to the first login page
                window.location.href = "./index.html";

            } catch (err) {
                console.log(err);
                failedToDeleteUser.textContent = "Failed to delete user. Please try again.";
                document.body.appendChild(failedToDeleteUser);
                throw new Error("Failed to delete user");
            }
        }
        //Log out button to log out user and take user back to login page 
         const logOutButton = document.createElement('button');
         logOutButton.textContent = "Log Out";
         logOutButton.classList.add('logout-button');
         logInpage.appendChild(logOutButton);

        logOutButton.addEventListener("click", backToMainPage);
        function backToMainPage() {
            window.location.href = "./index.html"
        }
    });
} else {
    console.error("No element/elements found");
}