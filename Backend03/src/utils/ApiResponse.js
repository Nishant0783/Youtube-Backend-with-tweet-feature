// In this file we will standardize Api response as we have done in ApiErrors.
// The point to put on note is: In case errors nodejs provides a class(Error) but for request and response we are not using only nodejs, we also use express so there is no such predefined class provided by nodejs or express, we have to define our own.

class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse };