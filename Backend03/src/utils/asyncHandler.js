// This is the file where we will create a utility method to handle the asynchronous nature of database.
// NOTE: Come here after reading aboit utility folder in Notes.txt file.

// Let's understand what we have to do in asynchronous nature of database:- 
// The thing is we have to do 2 common things('async-await' , 'try-catch(or Promises)') in every database logic, So our task here is create something so that we can pass it here and after processing from here it should gets wrapped inside 'async-await' and 'try-catch'.
// For eg: We have a function 'func1' with some logic. What we are expecting is:
// func1( 'Function Logic' ) --------> asyncHandler() --------> async func1( try{ await 'Function Logic'}catch('Error Handling') ).
// This is what we are expecting that our normal function should get passed to asyncHandler() and it should return us asynchrounous and error handled version of that function.

// Now from above example we can draw a conclusion: /** We want a function say "fn" which accepts a function say "fn1" and do some processing on it and return that processed "fn1" function. **/
// By carefully observing this conclusion we came to know that we need a "HIGHER ORDER FUNCTION(HOF)"(Go to Notes.txt to know about higher order functions.)

// So in this we will implement asyncHandler HOF in two different ways: 

// METHOD 1) Using try-catch

// const asyncHandler = (fn) => async (req, res, next) => {
//     try{
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         });
//         // If some error occurs then the error code sent by user(err.code) or 500 will be sent and a response is generated in json form where "success" flag is false and a "message" will be given.
//     }
// }
// In the above asyncHandler function we are accepting a function (fn) as a parameter and then making it aysnc and then wrapping in try-catch with await.

// This is short form of executing this function.
// Long form is:
// const asyncHandler = () => {} ---> This is a normal asyncHandler function.
// const asyncHandler = (fn) => {} ---> This is a function accepting a fucntion.
// Now if I want to pass this fn to another fraction, then,
// const asyncHandler = (fn) => {() => {}} ---> The round bracket inside curly braces are denoting another fraction.
// Now we can remove these curly braces because we want to direclty return the passed function.
// So final becomes: 
// const asyncHandler = (fn) => () => {}

// export {asyncHandler};


// Method 2) Using Promises

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    }
}

export {asyncHandler}


  
 

